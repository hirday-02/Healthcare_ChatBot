import clsx from 'clsx';
import './Tabs.css';

interface TabButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton = ({
  label,
  icon,
  isActive,
  onClick
}: TabButtonProps) => (
  <button
    className={clsx('tab-button', { active: isActive })}
    onClick={onClick}
    type="button"
  >
    <span className="tab-icon" aria-hidden>
      {icon}
    </span>
    {label}
  </button>
);

