import { Categories } from "@/app/interfaces/interfaces";

export default function SideCategory(props:Categories) {
  return (
    <section>
      <h3>{props.title}</h3>
      <ul></ul>
    </section>
  );
}