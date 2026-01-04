import { BottomNavBar } from "../../shared/components/ui/bottom-nav-bar";

export function BottomNavDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/5 dark:to-blue-900/10 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Bottom Navigation Bar Demo
          </h1>
          <p className="text-secondary">
            The bottom navigation bar is now integrated into the AI Career Guide platform.
            It appears on mobile and tablet devices for authenticated users.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Features</h2>
            <ul className="space-y-2 text-secondary">
              <li>• Smooth framer-motion animations</li>
              <li>• Responsive design with adaptive labels</li>
              <li>• Integrated with React Router navigation</li>
              <li>• Dark mode support</li>
              <li>• AI Career Guide themed icons and routes</li>
              <li>• Only visible on mobile/tablet for authenticated users</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Navigation Items</h2>
            <ul className="space-y-2 text-secondary">
              <li>• Dashboard - Main overview page</li>
              <li>• Profile - User profile and CV upload</li>
              <li>• Jobs - Job search functionality</li>
              <li>• Analytics - Career analytics dashboard</li>
              <li>• Data - Data injection page</li>
              <li>• Setup - Profile questionnaire</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-primary mb-4">Preview</h2>
          <p className="text-secondary mb-4">
            Below is a preview of the bottom navigation bar. On mobile devices, this will be fixed at the bottom of the screen.
          </p>
          
          {/* Demo navigation bar */}
          <div className="flex justify-center">
            <BottomNavBar stickyBottom={false} className="relative" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-secondary">
            To see the bottom navigation in action, log in to the platform and view it on a mobile device or resize your browser window.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BottomNavDemo;