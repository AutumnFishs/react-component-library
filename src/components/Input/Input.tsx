export interface InputProps {
  label: string;
  placeholder?: string;
}

import "./Input.scss";

export const Input = (props: InputProps) => {
  console.log(props);

  return <input placeholder={props?.placeholder}></input>;
};
export default Input;