import { FormEvent, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/Card";
import { profileService } from "../services/profileService";

export function QuestionnairePage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    experience_level: "student",
    goal: "graduate-role",
    focus_area: "backend",
    preferred_location: "remote",
    salary_expectations: "",
    interests: [] as string[],
  });

  const { data: existingData, isLoading } = useQuery({
    queryKey: ["questionnaire"],
    queryFn: () => profileService.getQuestionnaire(),
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        experience_level: existingData.experience_level || "student",
        goal: existingData.goal || "graduate-role",
        focus_area: existingData.focus_area || "backend",
        preferred_location: existingData.preferred_location || "remote",
        salary_expectations: existingData.salary_expectations?.toString() || "",
        interests: existingData.interests || [],
      });
    }
  }, [existingData]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => profileService.updateQuestionnaire({
      ...data,
      salary_expectations: data.salary_expectations ? Number(data.salary_expectations) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionnaire"] });
      alert("Questionnaire saved successfully!");
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-primary">Career Questionnaire</h2>
        <p className="text-sm text-secondary mt-1">
          Tell us about your current situation and goals so we can personalize recommendations.
        </p>
      </header>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Help us understand your career stage and goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Current experience level
              </label>
              <select
                className="input-base"
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="internship">Some internship experience</option>
                <option value="junior">Junior engineer (0–2 years)</option>
                <option value="mid">Mid-level engineer (2–5 years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Primary goal for the next 12–18 months
              </label>
              <select
                className="input-base"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              >
                <option value="graduate-role">Secure a graduate software engineering role</option>
                <option value="internship">Secure internships/placements during studies</option>
                <option value="portfolio">Build a strong portfolio and project experience</option>
                <option value="career-switch">Switch to a tech career</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Preferred focus area
              </label>
              <select
                className="input-base"
                value={formData.focus_area}
                onChange={(e) => setFormData({ ...formData, focus_area: e.target.value })}
              >
                <option value="backend">Backend / APIs / Cloud</option>
                <option value="frontend">Frontend / Web</option>
                <option value="fullstack">Full Stack</option>
                <option value="data">Data / ML / Analytics</option>
                <option value="security">Security / Infrastructure</option>
                <option value="mobile">Mobile Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Preferred location
              </label>
              <select
                className="input-base"
                value={formData.preferred_location}
                onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <Input
                label="Salary expectations (optional)"
                type="number"
                placeholder="e.g., 50000"
                value={formData.salary_expectations}
                onChange={(e) => setFormData({ ...formData, salary_expectations: e.target.value })}
                helperText="Annual salary in USD"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={mutation.isPending}>
              Save Questionnaire
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
