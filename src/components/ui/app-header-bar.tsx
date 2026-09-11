import { CommonHeader, CommonHeaderProps } from "@/components/ui/common-header";
import * as React from "react";

export interface AppHeaderBarProps extends CommonHeaderProps {
  /** Optional right-side subtitle (defaults to "Good to see you!") */
  rightSubtitle?: string;
  /** Optional callback fired when avatar/user badge is pressed */
  onAvatarPress?: () => void;
  /** Additional container styling */
  className?: string;
}

/**
 * Standardized Top Header Bar component.
 * Delegates layout and styling to CommonHeader.
 */
export const AppHeaderBar = React.memo(function AppHeaderBar({
  rightSubtitle = "",
  onAvatarPress,
  showAvatar = true,
  className = "",
  ...props
}: AppHeaderBarProps) {
  return (
    <CommonHeader
      rightSubtitle={rightSubtitle}
      onAvatarPress={onAvatarPress}
      showAvatar={showAvatar}
      className={className}
      {...props}
    />
  );
});
