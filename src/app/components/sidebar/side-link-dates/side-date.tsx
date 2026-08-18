import { Dates } from "@/app/interfaces/interfaces";

//type any for testing
export default function SideDate(props: any) {
  const items = props.year || props.month || [];

  return (

    <section>
      <h3>{props.title}</h3>
      <ul>
        {items.map((item: any, index: any) => (

          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}