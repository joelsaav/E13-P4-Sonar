export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export type AuthenticateMode = "login" | "register";

export interface LoginFormProps {
  forceMode?: AuthenticateMode;
  linkTo?: string;
}

export type IconType = React.ComponentType<{
  size?: number;
  stroke?: number;
  className?: string;
}>;

export interface ChartDataItem {
  [key: string]: string | number;
}

export interface ChartConfigType {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

export interface FeatureCardProps {
  icon?: IconType | string;
  title: string;
  description?: string;
  className?: string;
  bigDetails?: boolean;
  chart?: boolean;
  chartData?: ChartDataItem[];
  chartConfig?: ChartConfigType;
  details?: string | React.ReactNode;
  iconSize?: number;
  iconLabel?: string;
  children?: React.ReactNode;
}
