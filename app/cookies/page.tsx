"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DoubleFooter } from "@/components/double-footer"

export default function CookiePolicyPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Cookie Policy</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <h1>Cookie Policy</h1>
              <p>Last updated: May 29, 2024</p>

              <h2>1. Introduction</h2>
              <p>
                This Cookie Policy explains how AuditPro ("we," "our," or "us") uses cookies and similar technologies
                when you visit our website or use our services. This policy provides you with information about how we
                use these technologies, your choices regarding cookies, and further information about cookies.
              </p>

              <h2>2. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit
                a website. They are widely used to make websites work more efficiently, provide a better user
                experience, and give website owners information about how visitors use their site.
              </p>
              <p>Cookies can be:</p>
              <ul>
                <li>
                  <strong>Session cookies:</strong> These are temporary and expire when you close your browser.
                </li>
                <li>
                  <strong>Persistent cookies:</strong> These remain on your device until they expire or you delete them.
                </li>
                <li>
                  <strong>First-party cookies:</strong> Set by the website you are visiting.
                </li>
                <li>
                  <strong>Third-party cookies:</strong> Set by a domain other than the one you are visiting.
                </li>
              </ul>

              <h2>3. How We Use Cookies</h2>
              <p>We use cookies for various purposes, including:</p>
              <ul>
                <li>
                  <strong>Essential cookies:</strong> These are necessary for the website to function properly and
                  cannot be switched off. They are usually set in response to actions you take, such as setting your
                  privacy preferences, logging in, or filling in forms.
                </li>
                <li>
                  <strong>Performance cookies:</strong> These help us understand how visitors interact with our website
                  by collecting and reporting information anonymously. They help us improve the way our website works.
                </li>
                <li>
                  <strong>Functionality cookies:</strong> These enable the website to provide enhanced functionality and
                  personalization. They may be set by us or by third-party providers whose services we have added to our
                  pages.
                </li>
                <li>
                  <strong>Targeting/advertising cookies:</strong> These may be set through our site by our advertising
                  partners. They may be used by those companies to build a profile of your interests and show you
                  relevant advertisements on other sites.
                </li>
                <li>
                  <strong>Analytics cookies:</strong> These help us analyze how our website is used, allowing us to
                  improve functionality and user experience.
                </li>
              </ul>

              <h2>4. Specific Cookies We Use</h2>
              <table className="w-full border-collapse border border-gray-700 my-4">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-700 p-2 text-left">Name</th>
                    <th className="border border-gray-700 p-2 text-left">Provider</th>
                    <th className="border border-gray-700 p-2 text-left">Purpose</th>
                    <th className="border border-gray-700 p-2 text-left">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-700 p-2">_ga</td>
                    <td className="border border-gray-700 p-2">Google Analytics</td>
                    <td className="border border-gray-700 p-2">Used to distinguish users for analytics purposes</td>
                    <td className="border border-gray-700 p-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">_gid</td>
                    <td className="border border-gray-700 p-2">Google Analytics</td>
                    <td className="border border-gray-700 p-2">Used to distinguish users for analytics purposes</td>
                    <td className="border border-gray-700 p-2">24 hours</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">_gat</td>
                    <td className="border border-gray-700 p-2">Google Analytics</td>
                    <td className="border border-gray-700 p-2">Used to throttle request rate</td>
                    <td className="border border-gray-700 p-2">1 minute</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">auditpro_session</td>
                    <td className="border border-gray-700 p-2">AuditPro</td>
                    <td className="border border-gray-700 p-2">
                      Used to maintain your session while using our service
                    </td>
                    <td className="border border-gray-700 p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">auditpro_auth</td>
                    <td className="border border-gray-700 p-2">AuditPro</td>
                    <td className="border border-gray-700 p-2">
                      Used to remember your login status and authentication details
                    </td>
                    <td className="border border-gray-700 p-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">auditpro_preferences</td>
                    <td className="border border-gray-700 p-2">AuditPro</td>
                    <td className="border border-gray-700 p-2">
                      Stores your preferences such as theme choice and notification settings
                    </td>
                    <td className="border border-gray-700 p-2">1 year</td>
                  </tr>
                </tbody>
              </table>

              <h2>5. Third-Party Cookies</h2>
              <p>
                We use services from third parties who may also set cookies on our website. These third-party services
                include:
              </p>
              <ul>
                <li>
                  <strong>Google Analytics:</strong> Web analytics service provided by Google that tracks and reports
                  website traffic.
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing service that enables us to accept payments online.
                </li>
                <li>
                  <strong>Intercom:</strong> Customer messaging platform that allows us to communicate with our users.
                </li>
                <li>
                  <strong>HubSpot:</strong> Marketing, sales, and customer service platform.
                </li>
              </ul>
              <p>
                Please note that we do not have control over these third-party cookies. You can check the respective
                privacy policies of these third parties for more information about their cookies.
              </p>

              <h2>6. Managing Cookies</h2>
              <p>
                Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse
                cookies or delete certain cookies. Generally, you can also manage similar technologies in the same way
                that you manage cookies using your browser's preferences.
              </p>
              <p>Here are links to instructions for managing cookies in common browsers:</p>
              <ul>
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p>
                Please note that if you choose to block cookies, you may not be able to use all the features of our
                website.
              </p>

              <h2>7. Cookie Consent</h2>
              <p>
                When you first visit our website, we will ask for your consent to use cookies through a cookie banner.
                You can change your cookie preferences at any time by clicking on the "Cookie Settings" link in the
                footer of our website.
              </p>

              <h2>8. Changes to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our
                business practices. Any changes will be posted on this page with an updated revision date. We encourage
                you to check this page periodically to stay informed about our use of cookies.
              </p>

              <h2>9. Contact Us</h2>
              <p>If you have any questions about our use of cookies, please contact us at:</p>
              <p>
                Email: privacy@auditpro.com
                <br />
                Address: 123 Audit Street, San Francisco, CA 94103, USA
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
