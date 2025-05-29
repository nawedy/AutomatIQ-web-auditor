"use client"
import { LegalTemplate } from "@/components/legal/legal-template"

export default function GDPRCompliancePage() {
  return (
    <LegalTemplate title="GDPR Compliance" lastUpdated="May 29, 2024" type="compliance">
      <h2>General Data Protection Regulation (GDPR) Compliance</h2>
      <p>
        AuditPro is committed to protecting your personal data and respecting your privacy rights under the General Data
        Protection Regulation (GDPR). This page outlines how we comply with GDPR requirements and your rights as a data
        subject.
      </p>

      <h2>1. Legal Basis for Processing</h2>
      <p>We process your personal data based on the following legal grounds:</p>
      <ul>
        <li>
          <strong>Consent:</strong> When you have given clear consent for us to process your personal data for specific
          purposes (e.g., marketing communications).
        </li>
        <li>
          <strong>Contract:</strong> When processing is necessary for the performance of a contract with you or to take
          steps at your request before entering into a contract.
        </li>
        <li>
          <strong>Legal Obligation:</strong> When we need to process your data to comply with legal obligations.
        </li>
        <li>
          <strong>Legitimate Interest:</strong> When processing is necessary for our legitimate interests, provided your
          rights and freedoms are not overridden.
        </li>
      </ul>

      <h2>2. Your Rights Under GDPR</h2>
      <p>As a data subject, you have the following rights:</p>

      <h3>2.1 Right of Access</h3>
      <p>
        You have the right to request copies of your personal data. We may charge a small fee for this service if your
        request is clearly unfounded or excessive.
      </p>

      <h3>2.2 Right to Rectification</h3>
      <p>
        You have the right to request that we correct any information you believe is inaccurate or complete information
        you believe is incomplete.
      </p>

      <h3>2.3 Right to Erasure</h3>
      <p>You have the right to request that we erase your personal data, under certain conditions, including when:</p>
      <ul>
        <li>The personal data is no longer necessary for the original purpose</li>
        <li>You withdraw consent and there is no other legal ground for processing</li>
        <li>The personal data has been unlawfully processed</li>
        <li>Erasure is required for compliance with a legal obligation</li>
      </ul>

      <h3>2.4 Right to Restrict Processing</h3>
      <p>
        You have the right to request that we restrict the processing of your personal data under certain conditions.
      </p>

      <h3>2.5 Right to Data Portability</h3>
      <p>
        You have the right to request that we transfer the data we have collected to another organization, or directly
        to you, under certain conditions.
      </p>

      <h3>2.6 Right to Object</h3>
      <p>
        You have the right to object to our processing of your personal data, under certain conditions, including
        processing for direct marketing purposes.
      </p>

      <h2>3. Data Protection Officer</h2>
      <p>
        We have appointed a Data Protection Officer (DPO) to oversee our data protection strategy and ensure compliance
        with GDPR requirements. You can contact our DPO at:
      </p>
      <p>
        Email: dpo@auditpro.com
        <br />
        Address: Data Protection Officer, AuditPro Inc., 123 Audit Street, San Francisco, CA 94103, USA
      </p>

      <h2>4. Data Transfers</h2>
      <p>
        When we transfer your personal data outside the European Economic Area (EEA), we ensure appropriate safeguards
        are in place, including:
      </p>
      <ul>
        <li>Standard Contractual Clauses approved by the European Commission</li>
        <li>Adequacy decisions by the European Commission</li>
        <li>Binding Corporate Rules</li>
        <li>Certification schemes</li>
      </ul>

      <h2>5. Data Breach Notification</h2>
      <p>
        In the event of a data breach that is likely to result in a high risk to your rights and freedoms, we will
        notify you without undue delay and within 72 hours of becoming aware of the breach, where feasible.
      </p>

      <h2>6. Privacy by Design and Default</h2>
      <p>
        We implement privacy by design and default principles in our systems and processes, ensuring that privacy
        considerations are integrated into our business practices from the outset.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected,
        including for the purposes of satisfying any legal, accounting, or reporting requirements.
      </p>

      <h2>8. Exercising Your Rights</h2>
      <p>To exercise any of your rights under GDPR, please contact us using the following methods:</p>
      <ul>
        <li>Email: privacy@auditpro.com</li>
        <li>Online form: Available in your account settings</li>
        <li>Post: Privacy Team, AuditPro Inc., 123 Audit Street, San Francisco, CA 94103, USA</li>
      </ul>
      <p>
        We will respond to your request within one month of receipt. In complex cases, we may extend this period by two
        additional months, and we will inform you of any such extension.
      </p>

      <h2>9. Complaints</h2>
      <p>
        If you believe that our processing of your personal data violates GDPR, you have the right to lodge a complaint
        with a supervisory authority, particularly in the EU member state where you reside, work, or where the alleged
        violation occurred.
      </p>

      <h2>10. Updates to This Page</h2>
      <p>
        We may update this GDPR compliance page from time to time to reflect changes in our practices or applicable
        laws. We will notify you of any material changes by posting the updated page on our website.
      </p>
    </LegalTemplate>
  )
}
