// import { API } from "./config";
import { Data } from '@/app/interfaces/interfaces';
import { testCategories, testTransactions } from '@/app/data/testdata';


export async function getAllData(): Promise<Data> {

    
    return {
        categories: testCategories,
        transactions: testTransactions
    };

  
    // const response = await fetch(API, { method: 'GET' });
    //
    // // fetch only rejects on network errors, not on 404/500 -> check status first
    // if (!response.ok) {
    //     throw new Error(`Failed to load data (status ${response.status})`);
    // }
    //
    // return await response.json() as Data;
}
