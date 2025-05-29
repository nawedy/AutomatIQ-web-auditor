"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DoubleFooter } from "@/components/double-footer"

export default function RefundPolicyPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Refund Policy</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <h1>Refund Policy</h1>
              <p>Last updated: May 29, 2024</p>

              <h2>1. Introduction</h2>
              <p>
                At AuditPro, we want you to be completely satisfied with our services. This Refund Policy outlines the
                circumstances under which we will provide refunds for our services.
              </p>

              <h2>2. Free Trial</h2>
              <p>
                We offer a 14-day free trial for all new accounts. During this period, you can explore our services
                without any charge. If you decide to cancel during the free trial period, you will not be charged.
              </p>

              <h2>3. Subscription Refunds</h2>
              <h3>3.1 14-Day Money-Back Guarantee</h3>
              <p>
                We offer a 14-day money-back guarantee for all new paid subscriptions. If you are not satisfied with our
                service within the first 14 days after your initial payment, you may request a full refund.
              </p>
              <p>To be eligible for a refund under our money-back guarantee:</p>
              <ul>
                <li>Your account must be in good standing</li>
                <li>You must request the refund within 14 days of your initial payment</li>
                <li>You must provide a reason for your dissatisfaction</li>
              </ul>

              <h3>3.2 Prorated Refunds</h3>
              <p>
                After the initial 14-day period, we do not provide refunds for subscription cancellations. When you
                cancel your subscription:
              </p>
              <ul>
                <li>Your account will remain active until the end of your current billing period</li>
                <li>You will not be charged for future billing periods</li>
                <li>No partial or prorated refunds will be issued for unused time</li>
              </ul>

              <h3>3.3 Annual Subscriptions</h3>
              <p>
                For annual subscriptions, we may consider prorated refunds on a case-by-case basis if you cancel within
                the first 30 days of your subscription. After 30 days, no refunds will be provided for annual
                subscriptions.
              </p>

              <h2>4. Exceptions</h2>
              <p>We may provide refunds outside of our standard policy in the following cases:</p>
              <ul>
                <li>
                  <strong>Service Unavailability:</strong> If our service experiences significant downtime (more than 24
                  consecutive hours) or persistent technical issues that prevent you from using the service, we may
                  provide a prorated refund for the affected period.
                </li>
                <li>
                  <strong>Duplicate Charges:</strong> If you were charged multiple times for the same subscription, we
                  will refund the duplicate charges.
                </li>
                <li>
                  <strong>Unauthorized Charges:</strong> If you discover charges that you did not authorize, please
                  contact us immediately for investigation.
                </li>
              </ul>

              <h2>5. Non-Refundable Items</h2>
              <p>The following are not eligible for refunds:</p>
              <ul>
                <li>
                  <strong>Add-on Services:</strong> One-time purchases or add-on services are non-refundable once
                  delivered.
                </li>
                <li>
                  <strong>Enterprise Plans:</strong> Custom enterprise plans are subject to the terms specified in your
                  contract.
                </li>
                <li>
                  <strong>Accounts Terminated for Violations:</strong> If your account is terminated due to violations
                  of our Terms of Service, no refund will be provided.
                </li>
              </ul>

              <h2>6. Refund Process</h2>
              <p>To request a refund:</p>
              <ol>
                <li>
                  Contact our support team at support@auditpro.com with the subject line "Refund Request" or through our
                  support portal.
                </li>
                <li>
                  Include your account email address, the reason for your refund request, and any relevant details.
                </li>
                <li>Our team will review your request and respond within 2 business days.</li>
                <li>
                  If approved, refunds will be processed to the original payment method used for the purchase. The
                  timing of the refund depends on your payment provider and may take 5-10 business days to appear on
                  your statement.
                </li>
              </ol>

              <h2>7. Currency and Processing Fees</h2>
              <p>
                All refunds will be issued in the same currency as the original payment. Please note that we do not
                refund any payment processing fees charged by our payment processors or any currency conversion fees
                that may have been applied by your bank or credit card company.
              </p>

              <h2>8. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately
                upon posting on our website. We encourage you to review this policy periodically for any changes.
              </p>

              <h2>9. Contact Us</h2>
              <p>If you have any questions about our Refund Policy, please contact us at:</p>
              <p>
                Email: billing@auditpro.com
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
