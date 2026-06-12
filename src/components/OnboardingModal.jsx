import React from 'react';
import { illustrations, icons } from '../assets/index.js';
import { Modal } from '../ui.jsx';
import { BtnWithIcon } from './Icon.jsx';

const STEPS = [
  { title: 'Build', body: 'Add performers, acts, and segments to your running order.' },
  { title: 'Package', body: 'Export renamed media files and a styled RTF run sheet to a show folder.' },
  { title: 'Close out', body: 'Settle the night — track revenue, expenses, payouts, and export your ledger.' },
];

export default function OnboardingModal({ onDismiss }) {
  return (
    <Modal
      title="Welcome to Producer Pro"
      wide
      onClose={onDismiss}
      footer={
        <BtnWithIcon icon={icons.action('check')} className="btn primary" onClick={onDismiss}>
          Get started
        </BtnWithIcon>
      }
    >
      <div className="onboarding">
        <img
          src={illustrations.onboardingHero()}
          alt=""
          className="onboarding-hero"
          width={600}
          height={400}
        />
        <div className="onboarding-steps">
          {STEPS.map((step, i) => (
            <div key={step.title} className="onboarding-step">
              <span className="onboarding-step-num">{i + 1}</span>
              <div>
                <div className="onboarding-step-title">{step.title}</div>
                <div className="onboarding-step-body">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
