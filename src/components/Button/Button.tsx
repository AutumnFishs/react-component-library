export interface ButtonProps {
  label: string;
  primary?: boolean;
}

import "./Button.scss";

export const Button = (props: ButtonProps) => {
  return <button>{props.label}</button>;
};
export default Button;
