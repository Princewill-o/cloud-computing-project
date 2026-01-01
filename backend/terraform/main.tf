# Terraform configuration for GCP infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "sql-component.googleapis.com",
    "storage-component.googleapis.com",
    "pubsub.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "aiplatform.googleapis.com",
    "secretmanager.googleapis.com"
  ])

  service = each.key
  disable_on_destroy = false
}

# Cloud Storage bucket for CV files
resource "google_storage_bucket" "cv_storage" {
  name     = "${var.project_id}-cvs-${var.environment}"
  location = var.region

  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 730
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["https://${var.project_id}.web.app", "http://localhost:3000"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Cloud SQL instance
resource "google_sql_database_instance" "postgres" {
  name             = "career-guide-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = var.environment == "prod" ? "db-n1-standard-2" : "db-f1-micro"
    
    disk_type    = "PD_SSD"
    disk_size    = var.environment == "prod" ? 100 : 20
    disk_autoresize = true

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }

    database_flags {
      name  = "max_connections"
      value = var.environment == "prod" ? "200" : "100"
    }
  }

  deletion_protection = var.environment == "prod" ? true : false
}

# Database
resource "google_sql_database" "database" {
  name     = "career_guide"
  instance = google_sql_database_instance.postgres.name
}

# Database user
resource "google_sql_user" "app_user" {
  name     = "app_user"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Pub/Sub topics
resource "google_pubsub_topic" "cv_processing" {
  name = "cv-processing"
}

resource "google_pubsub_topic" "recommendations" {
  name = "recommendations"
}

resource "google_pubsub_topic" "notifications" {
  name = "notifications"
}

# Pub/Sub subscriptions
resource "google_pubsub_subscription" "cv_processing_sub" {
  name  = "cv-processing-sub"
  topic = google_pubsub_topic.cv_processing.name

  ack_deadline_seconds = 600

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }
}

resource "google_pubsub_topic" "dead_letter" {
  name = "dead-letter"
}

# Secret Manager secrets
resource "google_secret_manager_secret" "db_password" {
  secret_id = "database-password"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret" "api_secret_key" {
  secret_id = "api-secret-key"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "api_secret_key" {
  secret      = google_secret_manager_secret.api_secret_key.id
  secret_data = random_password.api_secret.result
}

resource "random_password" "api_secret" {
  length  = 64
  special = true
}

# Service account for the application
resource "google_service_account" "app_service_account" {
  account_id   = "career-guide-app"
  display_name = "Career Guide Application Service Account"
}

# IAM bindings for service account
resource "google_project_iam_member" "app_permissions" {
  for_each = toset([
    "roles/storage.admin",
    "roles/cloudsql.client",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/secretmanager.secretAccessor",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
    "roles/aiplatform.user"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Cloud Run service
resource "google_cloud_run_service" "api" {
  name     = "career-guide-api"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.app_service_account.email
      
      containers {
        image = "gcr.io/${var.project_id}/career-guide-api:latest"
        
        resources {
          limits = {
            cpu    = var.environment == "prod" ? "2000m" : "1000m"
            memory = var.environment == "prod" ? "2Gi" : "1Gi"
          }
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }

        env {
          name  = "GCP_REGION"
          value = var.region
        }

        env {
          name  = "GCS_BUCKET_NAME"
          value = google_storage_bucket.cv_storage.name
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_password.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "SECRET_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.api_secret_key.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name  = "ENABLE_MONITORING"
          value = "true"
        }

        env {
          name  = "ENABLE_BACKGROUND_TASKS"
          value = "true"
        }

        ports {
          container_port = 8000
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = var.environment == "prod" ? "1" : "0"
        "autoscaling.knative.dev/maxScale" = var.environment == "prod" ? "100" : "10"
        "run.googleapis.com/cpu-throttling" = "false"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.apis]
}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Monitoring alert policies
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate - Career Guide API"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"career-guide-api\""
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.05
      duration        = "300s"
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = []
  enabled = true
}

# Outputs
output "cloud_run_url" {
  value = google_cloud_run_service.api.status[0].url
}

output "database_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "storage_bucket_name" {
  value = google_storage_bucket.cv_storage.name
}

output "service_account_email" {
  value = google_service_account.app_service_account.email
}