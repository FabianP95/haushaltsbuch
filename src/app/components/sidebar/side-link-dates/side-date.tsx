import styles from './side-date.module.scss'
import { SideDateProps } from '@/app/interfaces/interfaces';


export default function SideDate(props: SideDateProps) {

  const items: (number | string)[] = props.year || props.month || [];

  return (

    <section className={styles.listContainer}>
      <h3 className={styles.listHeader}>{props.title}</h3>
      <ul className={styles.list}>
        {items.map((item) => (

       
          <li className={styles.listItem} key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}