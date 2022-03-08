// USMAN
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import math from "mathjs";


function Seed() {
  const row = 3;
  const col = 3;
  console.log("WE got the seed function boys");

  const dbh = firebase.firestore();


  let objname = "";
  let x = "";
  let y = "";
  let health = 1;
  let id = "";

  for (let r = 0; r < row; r++) {
      const curCollection = dbh.collection(`row${r}`).doc(`master${r}`);
      for (let c = 0; c < col; c++) {
          let objExists = Math.random();
          if (objExists <  0.05) {
              id =  Math.random().toString(16).slice(2)
              x = Math.round(Math.random() * 100) / 100
              y = Math.round(Math.random() * 100) / 100
              let val = Math.random();
              //Make trees
              if (val < 0.5) {
                  objname = "tree";
              } else { //Make rocks
                objname = "rock";
              }

              curCollection.collection(`col${c}`).add({
                name: objname,
                x: x,
                y: y,
                health: health,
                id: id,
              });
          } else {
            curCollection.collection(`col${c}`).add({
                name: "",
                x: "",
                y: "",
                health: health,
                id: "",
              });

          }

      }
  }

}
export default Seed;
