
import styles from './page.module.scss'

import ExpenseOverview from "./components/overview/expense-overview";
import AddEntry from "./components/add-entry/add-entry";
import Sidebar from "./components/sidebar/sidebar";

export default function Home() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.mainView}>
        <ExpenseOverview/>
        {/* <AddEntry/> */}
      </div>
      

    </div>
  );
}
