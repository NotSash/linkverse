import React from 'react';
import Button from '@/components/common/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'gradient' | 'outline';
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const sizeConfig = {
  sm: { wrapper: 'py-6 px-4', icon: 'text-3xl mb-2', title: 'text-base', desc: 'text-xs' },
  md: { wrapper: 'py-12 px-6', icon: 'text-5xl mb-3', title: 'text-xl', desc: 'text-sm' },
  lg: { wrapper: 'py-16 px-8', icon: 'text-6xl mb-4', title: 'text-2xl', desc: 'text-base' },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionText,
  onAction,
  actionVariant = 'primary',
  secondaryActionText,
  onSecondaryAction,
  className = '',
  size = 'md',
  children,
}) => {
  const s = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.wrapper} ${className}`}>
      <div className={s.icon} role="img" aria-hidden="true">
        {icon}
      </div>

      <h3 className={`text-gray-700 font-semibold ${s.title}`}>{title}</h3>

      {description && (
        <p className={`text-gray-500 mt-2 max-w-md ${s.desc}`}>{description}</p>
      )}

      {children && <div className="mt-4">{children}</div>}

      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          {actionText && onAction && (
            <Button variant={actionVariant} onClick={onAction} size="md">
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction} size="md">
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

// Pre-configured empty states

export const NoLinksState: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon="🔗"
    title="No links yet!"
    description="Add your first link to get started. Share your content, social profiles, and more."
    actionText="Add Your First Link"
    onAction={onAdd}
    actionVariant="gradient"
  />
);

export const NoAnalyticsState: React.FC<{ onShare?: () => void }> = ({ onShare }) => (
  <EmptyState
    icon="📈"
    title="No analytics data yet"
    description="Share your LinkVerse page to start tracking views and clicks."
    actionText="Share Your Page"
    onAction={onShare}
  />
);

export const NoPaymentsState: React.FC = () => (
  <EmptyState
    icon="💳"
    title="No payments yet"
    description="You haven't made any payments. Subscribe to Pro to publish your page."
    size="sm"
  />
);

export const NoSocialLinksState: React.FC = () => (
  <EmptyState
    icon="📱"
    title="No social links added"
    description="Add your social media handles to display them on your public profile."
    size="sm"
  />
);

export const NoTicketsState: React.FC = () => (
  <EmptyState
    icon="🎫"
    title="No support tickets"
    description="All quiet here! No support tickets to show."
    size="sm"
  />
);

export const NoUsersState: React.FC = () => (
  <EmptyState
    icon="👥"
    title="No users found"
    description="No users match your search criteria. Try adjusting your filters."
    size="sm"
  />
);

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Something went wrong. Please try again.', onRetry }) => (
  <EmptyState
    icon="⚠️"
    title="Oops! Something went wrong"
    description={message}
    actionText={onRetry ? 'Try Again' : undefined}
    onAction={onRetry}
  />
);