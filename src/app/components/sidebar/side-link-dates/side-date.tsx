import styles from './side-date.module.scss'

//type any for testing
export default function SideDate(props: any) {
  const items = props.year || props.month || [];

  return (

    <section className={styles.listContainer}>
      <h3 className={styles.listHeader}>{props.title}</h3>
      <ul className={styles.list}>
        {items.map((item: any, index: any) => (

          <li className={styles.listItem} key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}