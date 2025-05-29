"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DoubleFooter } from "@/components/double-footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Privacy Policy</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <h1>Privacy Policy</h1>
              <p>Last updated: May 29, 2024</p>

              <h2>1. Introduction</h2>
              <p>
                Welcome to AuditPro ("we," "our," or "us"). We are committed to protecting your privacy and personal
                data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                you use our website audit service.
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you
                have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not
                agree with our policies and practices, please do not use our Service.
              </p>

              <h2>2. Information We Collect</h2>

              <h3>2.1 Personal Data</h3>
              <p>We may collect the following types of personal data:</p>
              <ul>
                <li>
                  <strong>Account Information:</strong> When you register for an account, we collect your name, email
                  address, and password.
                </li>
                <li>
                  <strong>Billing Information:</strong> If you purchase a subscription, we collect payment information,
                  billing address, and transaction history.
                </li>
                <li>
                  <strong>Profile Information:</strong> Information you provide in your user profile, such as job title,
                  company name, and profile picture.
                </li>
                <li>
                  <strong>Website Data:</strong> URLs and other information about websites you submit for auditing.
                </li>
                <li>
                  <strong>Communications:</strong> Information you provide when contacting our support team or
                  responding to surveys.
                </li>
              </ul>

              <h3>2.2 Usage Data</h3>
              <p>We automatically collect certain information when you visit, use, or navigate our Service:</p>
              <ul>
                <li>
                  <strong>Device Information:</strong> IP address, browser type and version, operating system, device
                  type, and other technical identifiers.
                </li>
                <li>
                  <strong>Usage Information:</strong> Pages visited, features used, time spent on pages, navigation
                  paths, and other interaction data.
                </li>
                <li>
                  <strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to
                  collect and store information. See our Cookie Policy for more details.
                </li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including:</p>
              <ul>
                <li>Providing, maintaining, and improving our Service</li>
                <li>Processing your transactions and managing your account</li>
                <li>Sending you technical notices, updates, security alerts, and support messages</li>
                <li>Responding to your comments, questions, and requests</li>
                <li>Monitoring usage patterns and analyzing trends</li>
                <li>Detecting, preventing, and addressing technical issues and security breaches</li>
                <li>Personalizing your experience and delivering content relevant to your interests</li>
                <li>Sending marketing communications (with your consent where required by law)</li>
              </ul>

              <h2>4. How We Share Your Information</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>
                  <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g.,
                  payment processing, data analysis, email delivery).
                </li>
                <li>
                  <strong>Business Partners:</strong> With your consent, we may share your information with our business
                  partners to offer you certain products, services, or promotions.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to respond to legal process, protect our
                  rights, or protect the safety of others.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your
                  information may be transferred as a business asset.
                </li>
                <li>
                  <strong>With Your Consent:</strong> We may share your information for any other purpose disclosed to
                  you with your consent.
                </li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against
                unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of
                transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute
                security.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes for which we
                collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the
                data, the potential risk of harm from unauthorized use or disclosure, and applicable legal requirements.
              </p>

              <h2>7. Your Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal data:</p>
              <ul>
                <li>
                  <strong>Access:</strong> You can request copies of your personal data.
                </li>
                <li>
                  <strong>Rectification:</strong> You can request that we correct inaccurate or incomplete information.
                </li>
                <li>
                  <strong>Erasure:</strong> You can request that we delete your personal data in certain circumstances.
                </li>
                <li>
                  <strong>Restriction:</strong> You can request that we restrict the processing of your data in certain
                  circumstances.
                </li>
                <li>
                  <strong>Data Portability:</strong> You can request a copy of your data in a machine-readable format.
                </li>
                <li>
                  <strong>Objection:</strong> You can object to our processing of your personal data in certain
                  circumstances.
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Where we rely on your consent, you can withdraw it at any time.
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us using the details provided in the "Contact Us" section. We
                may need to verify your identity before responding to your request.
              </p>

              <h2>8. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and processed in, countries other than the country in which you
                reside. These countries may have data protection laws that are different from the laws of your country.
                We ensure that appropriate safeguards are in place to protect your personal data when it is transferred
                internationally.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under the age of 16. We do not knowingly collect personal data
                from children under 16. If you are a parent or guardian and believe your child has provided us with
                personal data, please contact us, and we will take steps to delete such information.
              </p>

              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The updated version will be indicated by an updated
                "Last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about
                how we are protecting your information.
              </p>

              <h2>11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
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
