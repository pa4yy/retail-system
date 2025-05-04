function Button({ children, ...props }) {
  return <button style={{ backgroundColor: 'red', color: 'white' }} {...props}>{children}</button>;
}

export default Button;


