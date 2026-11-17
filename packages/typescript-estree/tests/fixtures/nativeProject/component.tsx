interface CardProps {
  title: string;
}

function Card({ title }: CardProps) {
  return <article data-title={title}>{title}</article>;
}

// Preserve this JSX comment in the converted output.
export const element = <Card title="Native JSX" />;
