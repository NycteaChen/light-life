import React, { useEffect, useState } from "react";
import DietitianData from "./DietitianData.js";
import style from "../../../style/findDietitian.module.scss";
import image from "../../../images/about.png";

function GetDietitiansData({ props, setReserve, profile }) {
  const [isCheck, setIsCheck] = useState(false); //false
  const [checkIndex, setCheckIndex] = useState("");
  const bindCheckHandler = (e) => {
    setCheckIndex(e.target.id);
    setIsCheck(true);
  };
  console.log(props);
  console.log(profile);

  return (
    <div className={style.dietitianList}>
      {props.map((d, index) => (
        <div key={index} className={style.dietitian}>
          <img src={props ? d.image : ""} alt="dietitian"></img>
          <div>
            <div className={style.col}>
              <div className={style.name}>{d.name}營養師</div>
              <button onClick={bindCheckHandler} id={index}>
                查看詳情
              </button>
              {isCheck && index === parseInt(checkIndex) ? (
                <DietitianData
                  setReserve={setReserve}
                  props={d}
                  setIsCheck={setIsCheck}
                  profile={profile}
                />
              ) : (
                ""
              )}
            </div>
            <div className={style.info} style={{ textAlign: "left" }}>
              <div>
                學歷： {d.education["school"]} {d.education["degree"]}
              </div>
              <div>
                專長：
                {d.skills.weightControl ? "體重管理　" : ""}
                {d.skills.sportNT ? "運動營養　" : ""}
                {d.skills.threeHigh ? "三高控制　" : ""}
                {d.skills.bloodSugar ? "血糖控制" : ""}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GetDietitiansData;
