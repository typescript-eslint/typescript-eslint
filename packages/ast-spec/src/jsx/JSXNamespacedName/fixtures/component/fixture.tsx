const x = <NamespacePropComponent a:b="tight spacing" />;
const y = <NamespacePropComponent a:b="loose spacing" />;

interface NamespacePropComponentProps {
  'a:b': string;
}

function NamespacePropComponent(props: NamespacePropComponentProps) {
  return <div>{props['a:b']}</div>;
}
