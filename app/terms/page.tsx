"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DoubleFooter } from "@/components/double-footer"

export default function TermsOfServicePage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Terms of Service</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <h1>Terms of Service</h1>
              <p>Last updated: May 29, 2024</p>

              <h2>1. Introduction</h2>
              <p>
                Welcome to AuditPro. These Terms of Service ("Terms") govern your access to and use of the AuditPro
                website, applications, and services (collectively, the "Service"). By accessing or using the Service,
                you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the
                Service.
              </p>

              <h2>2. Definitions</h2>
              <p>In these Terms:</p>
              <ul>
                <li>
                  <strong>"AuditPro,"</strong> "we," "us," or "our" refers to AuditPro, Inc.
                </li>
                <li>
                  <strong>"User,"</strong> "you," or "your" refers to any individual or entity that accesses or uses the
                  Service.
                </li>
                <li>
                  <strong>"Content"</strong> refers to any information, data, text, software, graphics, messages, or
                  other materials that are generated, provided, or otherwise made accessible on or through the Service.
                </li>
                <li>
                  <strong>"User Content"</strong> refers to Content that users provide to be made available through the
                  Service, including website URLs submitted for auditing.
                </li>
              </ul>

              <h2>3. Account Registration and Security</h2>
              <p>
                To use certain features of the Service, you may need to create an account. You agree to provide
                accurate, current, and complete information during the registration process and to update such
                information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your account credentials and for all activities that occur under
                your account. You agree to notify us immediately of any unauthorized use of your account or any other
                breach of security. We cannot and will not be liable for any loss or damage arising from your failure to
                comply with this section.
              </p>

              <h2>4. Subscription and Payment</h2>
              <p>
                Some aspects of the Service may be provided for a fee. You will be required to select a payment plan and
                provide accurate payment information. You agree to pay all fees in accordance with the payment plan you
                select.
              </p>
              <p>
                All fees are exclusive of taxes, which we will charge as applicable. You agree to pay any taxes
                applicable to your use of the Service.
              </p>
              <p>
                Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current
                billing period. You can cancel your subscription at any time through your account settings or by
                contacting our customer support.
              </p>

              <h2>5. Free Trial</h2>
              <p>
                We may offer a free trial period for our Service. At the end of the trial period, we will automatically
                charge the payment method you provided unless you cancel before the trial ends.
              </p>

              <h2>6. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>
                  Use the Service for any illegal purpose or in violation of any local, state, national, or
                  international law
                </li>
                <li>
                  Violate or encourage others to violate the rights of third parties, including intellectual property
                  rights
                </li>
                <li>Submit websites containing malware, viruses, or other malicious code</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Use automated scripts to collect information from or interact with the Service</li>
                <li>
                  Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or
                  entity
                </li>
                <li>
                  Submit websites that contain illegal, obscene, defamatory, threatening, or otherwise harmful content
                </li>
              </ul>

              <h2>7. Intellectual Property Rights</h2>
              <p>
                The Service and its original content, features, and functionality are owned by AuditPro and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property
                or proprietary rights laws.
              </p>
              <p>
                You retain all rights in the User Content you submit, but you grant us a worldwide, non-exclusive,
                royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such User
                Content in connection with providing the Service to you.
              </p>

              <h2>8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <p>
                AUDITPRO DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS
                WILL BE CORRECTED, OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR
                OTHER HARMFUL COMPONENTS.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL AUDITPRO, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR
                INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE;
                (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR
                TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER
                LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR
                ACCESSING OR USING THE SERVICE DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE
                LIABILITY.
              </p>

              <h2>10. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless AuditPro, its officers, directors, employees, and
                agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt,
                and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to
                the Service; (ii) your violation of any term of these Terms; (iii) your violation of any third-party
                right, including without limitation any copyright, property, or privacy right; or (iv) any claim that
                your User Content caused damage to a third party.
              </p>

              <h2>11. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your
                account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>

              <h2>12. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will
                provide notice of any material changes by posting the updated Terms on this page with a new effective
                date. Your continued use of the Service after any such changes constitutes your acceptance of the new
                Terms.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California,
                without regard to its conflict of law provisions.
              </p>

              <h2>14. Dispute Resolution</h2>
              <p>
                Any dispute arising from or relating to these Terms or the Service shall be resolved through binding
                arbitration in San Francisco, California, under the rules of the American Arbitration Association. The
                arbitration shall be conducted by a single arbitrator, and judgment on the award may be entered in any
                court having jurisdiction.
              </p>
              <p>
                You agree that any arbitration shall be limited to the dispute between you and AuditPro and shall not be
                consolidated with any other arbitration. You also agree that you may bring claims against AuditPro only
                in your individual capacity and not as a plaintiff or class member in any purported class or
                representative proceeding.
              </p>

              <h2>15. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any other legal notices published by us on the
                Service, constitute the entire agreement between you and AuditPro concerning the Service.
              </p>

              <h2>16. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p>
                Email: legal@auditpro.com
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
