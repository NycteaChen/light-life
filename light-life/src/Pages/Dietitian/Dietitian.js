import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useLocation,
} from "react-router-dom";
import firebase from "firebase/app";
import "firebase/firestore";
import logo from "../../images/lightlife-straight.png";
import noImage from "../../images/noimage.png";
import exit from "../../images/exit.png";
import InvitedList from "./Invite/InvitedList.js";
import DietitianProfile from "../Dietitian/DietitianProfile/DietitianProfile.js";
import CustomerProfile from "../Components/CustomerProfile/CustomerProfile.js";
import DietrayRecord from "../Components/DietaryRecord/DietaryRecord.js";
import DietitianTarget from "../Dietitian/Target/DietitianTarget.js";
import GetPublication from "../Dietitian/FindCustomers/GetPublication.js";
import basic from "../../style/basic.module.scss";
import style from "../../style/customerData.module.scss";
import customer from "../../style/customerProfile.module.scss";
import styled from "styled-components";

function Dietitian() {
  const [users, setUsers] = useState([]);
  const [invitedList, setInvitedList] = useState([]);
  const [profile, setProfile] = useState({});
  const [selectedID, setSelectedID] = useState("");
  const [display, setDisplay] = useState("none");
  const [date, setDate] = useState({});
  const dietitianID = useParams().dID;
  const customerID = useLocation().pathname.split("/")[4];
  const today = new Date(+new Date() + 8 * 3600 * 1000).getTime();
  const getToday = new Date(+new Date() + 8 * 3600 * 1000)
    .toISOString()
    .substr(0, 10);
  const todayTime = new Date(getToday).getTime();
  const [pending, setPending] = useState(null);
  const input = {};
  const props = {};
  console.log(pending);
  console.log(users);
  useEffect(() => {
    firebase
      .firestore()
      .collection("customers")
      .where("dietitian", "==", dietitianID)
      .get()
      .then((snapshot) => {
        const usersArray = [];
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            usersArray.push(doc.data());
          });
          usersArray.forEach((i, index) => {
            firebase
              .firestore()
              .collection("dietitians")
              .doc(dietitianID)
              .collection("customers")
              .doc(i.id)
              .get()
              .then((res) => {
                if (res.exists) {
                  const endDate = new Date(res.data().endDate).getTime();
                  if (endDate < todayTime) {
                    firebase
                      .firestore()
                      .collection("customers")
                      .doc(i.id)
                      .update({
                        dietitian: firebase.firestore.FieldValue.delete(),
                      });
                    usersArray.splice(index, 1);
                  } else {
                    setUsers(usersArray);
                  }
                }
              });
          });
        }

        firebase
          .firestore()
          .collection("pending")
          .where("dietitian", "==", dietitianID)
          .get()
          .then((docs) => {
            const pendingArray = [];
            if (!docs.empty) {
              docs.forEach((doc) => {
                pendingArray.push(doc.data());
              });
              const promises = [];
              pendingArray.forEach((p) => {
                const promise = firebase
                  .firestore()
                  .collection("customers")
                  .doc(p.customer)
                  .get()
                  .then((res) => {
                    return {
                      ...p,
                      customerName: res.data().name,
                      customerGender: res.data().gender,
                    };
                  });
                promises.push(promise);
              });
              Promise.all(promises).then((res) => {
                res.sort((a, b) => {
                  const dateA = new Date(a.startDate).getTime();
                  const dateB = new Date(b.startDate).getTime();
                  if (dateA < dateB) {
                    return -1;
                  } else if (dateA > dateB) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
                const newPendingArray = [];
                res.forEach((r) => {
                  const start = new Date(r.startDate).getTime();
                  console.log(r);
                  if (r.startDate === getToday) {
                    firebase
                      .firestore()
                      .collection("customers")
                      .doc(r.customer)
                      .update({ dietitian: r.dietitian })
                      .then(() => {
                        firebase
                          .firestore()
                          .collection("customers")
                          .doc(r.customer)
                          .get()
                          .then((doc) => {
                            console.log(usersArray);
                            if (
                              usersArray.length > 0 &&
                              !usersArray.find((i) => i.id === doc.data().id)
                            ) {
                              setUsers([...usersArray, doc.data()]);
                            } else if (usersArray.length > 0) {
                              setUsers([...usersArray]);
                            } else {
                              setUsers([doc.data()]);
                            }
                          })
                          .then(() => {
                            firebase
                              .firestore()
                              .collection("pending")
                              .doc(r.id)
                              .delete()
                              .then(() => {
                                console.log("Document successfully deleted!");
                              })
                              .catch((error) => {
                                console.error(
                                  "Error removing document: ",
                                  error
                                );
                              });
                          });
                      });
                    firebase
                      .firestore()
                      .collection("dietitians")
                      .doc(r.dietitian)
                      .collection("customers")
                      .doc(r.customer)
                      .set({
                        startDate: r.startDate,
                        endDate: r.endDate,
                      });
                  } else if (start < todayTime) {
                    console.log("晚");
                  } else {
                    newPendingArray.push(r);
                  }
                });
                setPending(newPendingArray);
              });
            } else {
              setPending([]);
            }
            // });
          });
      });
    console.log(pending);
    firebase
      .firestore()
      .collection("reserve")
      .where("dietitian", "==", dietitianID)
      .get()
      .then((docs) => {
        const invitedArray = [];
        docs.forEach((doc) => {
          const startDate = new Date(doc.data().reserveStartDate).getTime();

          if (startDate > today && doc.data().status === "0") {
            invitedArray.push(doc.data());
          }
        });
        setInvitedList(invitedArray);
      });
    firebase
      .firestore()
      .collection("dietitians")
      .doc(dietitianID)
      .get()
      .then((res) => setProfile(res.data()));

    if (customerID) {
      firebase
        .firestore()
        .collection("dietitians")
        .doc(dietitianID)
        .collection("customers")
        .doc(customerID)
        .get()
        .then((doc) => {
          setDate({
            start: doc.data().startDate,
            end: doc.data().endDate,
          });
        });
    }
  }, []);

  const getSelectedCustomer = (e) => {
    setSelectedID(e.target.className);
    firebase
      .firestore()
      .collection("dietitians")
      .doc(dietitianID)
      .collection("customers")
      .doc(e.target.className)
      .get()
      .then((doc) => {
        setDate({
          start: doc.data().startDate,
          end: doc.data().endDate,
        });
      });
  };

  const bindListHandler = (e) => {
    if (e.target.className.includes("list")) {
      setDisplay("block");
    } else {
      setDisplay("none");
    }
  };
  const logoutHandler = () => {
    firebase
      .auth()
      .signOut()
      .then(function () {
        alert("已登出");
        // 登出後強制重整一次頁面
        window.location.href = "/";
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const changeServiceStatusHandler = () => {
    if (profile.education && profile.gender) {
      setProfile({ ...profile, isServing: !profile.isServing });
      firebase
        .firestore()
        .collection("dietitians")
        .doc(dietitianID)
        .update({ isServing: !profile.isServing });
    } else {
      alert("您的個人資料尚未填寫完整喔");
    }
  };
  // if (users.length > 0) {
  if (profile.name) {
    return (
      <>
        <main className={basic["d-main"]}>
          <nav>
            <a href="/">
              <img src={logo} id={basic["menu-logo"]} />
            </a>
            <div className={basic["straight-nav"]}>
              <Link
                className={basic["nav-title"]}
                to={`/dietitian/${dietitianID}/profile`}
              >
                <div onClick={bindListHandler}>編輯會員資料</div>
              </Link>
              <ul>
                <div
                  className={`${basic["nav-title"]} list`}
                  onClick={bindListHandler}
                >
                  客戶清單
                </div>
                <div
                  className={`${basic.customerList} list`}
                  style={{ display: display }}
                >
                  {users.length > 0
                    ? users.map((c, index) => (
                        <li
                          key={index}
                          className={c.id}
                          onClick={getSelectedCustomer}
                        >
                          <Link
                            to={`/dietitian/${c.dietitian}/customer/${c.id}`}
                            className={c.id}
                            style={{ fontSize: "16px" }}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))
                    : ""}
                </div>
              </ul>

              <Link
                className={basic["nav-title"]}
                to={`/dietitian/${dietitianID}/findCustomers`}
              >
                <div onClick={bindListHandler}>找客戶</div>
              </Link>

              <Link
                className={basic["nav-title"]}
                to={`/dietitian/${dietitianID}/inviteMe`}
              >
                <div onClick={bindListHandler}>誰找我</div>
              </Link>
              <Link
                className={basic["nav-title"]}
                onClick={bindListHandler}
                to={`/dietitian/${dietitianID}`}
              >
                返回會員主頁
              </Link>
              <a onClick={logoutHandler}>
                <img src={exit} alt="logout" id={basic.logout} />
              </a>
              <div className={basic.copyright}>&copy;2021 Light Life</div>
            </div>
          </nav>

          <div className={basic.profile}>
            <img src={profile.image ? profile.image : noImage} />
            <div className={basic.welcome}>
              <div>{profile.name ? profile.name : ""}，您好</div>
              <div className={basic["service-status"]}>
                <div>服務狀態：{profile.isServing ? "公開" : "私人"}</div>
                <div>
                  <input
                    type="checkbox"
                    id="service"
                    className={`${basic.toggle} ${basic["toggle-round"]}`}
                    checked={profile.isServing ? true : false}
                    onClick={changeServiceStatusHandler}
                  />
                  <label className={basic.label} for="service"></label>
                </div>
              </div>
            </div>
            <div className={basic["d-List"]}>
              <Link
                to={`/dietitian/${dietitianID}/profile`}
                onClick={bindListHandler}
              >
                <div>編輯會員資料</div>
              </Link>
              <Link
                to={`/dietitian/${dietitianID}/findCustomers`}
                onClick={bindListHandler}
              >
                <div>找客戶</div>
              </Link>

              <Link
                className="list"
                to={`/dietitian/${dietitianID}/customers`}
                onClick={bindListHandler}
              >
                <div className="list">客戶清單</div>
              </Link>

              <Link
                to={`/dietitian/${dietitianID}/inviteMe`}
                onClick={bindListHandler}
              >
                <div> 誰找我</div>
              </Link>
            </div>
          </div>

          <Switch>
            <Route exact path="/dietitian/:dID">
              <div className={basic.indexMessage}>
                <div>{profile.name}營養師，歡迎回來！</div>
                <div>
                  <div>
                    <div>尚未進行的服務</div>
                    {pending ? (
                      pending.length > 0 ? (
                        pending.map((p) => (
                          <div>
                            <div>
                              <div>
                                {p.customerName}{" "}
                                {p.customerGender === "男" ? "先生" : "小姐"}
                              </div>
                              <div>
                                時間：{p.startDate}~{p.endDate}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div>無</div>
                      )
                    ) : (
                      <div>loading</div>
                    )}
                  </div>
                </div>
              </div>
            </Route>
            <Route exact path={`/dietitian/:dID/profile`}>
              <DietitianProfile profile={profile} setProfile={setProfile} />
            </Route>

            <Route exact path={`/dietitian/:dID/findCustomers`}>
              <GetPublication />
            </Route>

            <Route exact path={`/dietitian/:dID/customers`}>
              <div
                className={basic.mobileCustomerList}
                style={{ display: display }}
              >
                {users.length > 0 ? (
                  users.map((c, index) => (
                    <li
                      key={index}
                      className={c.id}
                      onClick={getSelectedCustomer}
                    >
                      <Link
                        to={`/dietitian/${c.dietitian}/customer/${c.id}`}
                        className={c.id}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <div>目前沒有客戶喔</div>
                )}
              </div>
            </Route>
            <Route exact path={`/dietitian/:dID/inviteMe`}>
              <div>
                <InvitedList
                  invitedList={invitedList}
                  setInvitedList={setInvitedList}
                  setPending={setPending}
                />
              </div>
            </Route>
          </Switch>

          <Switch>
            <Route
              path={`/dietitian/${dietitianID}/customer/${
                customerID ? customerID : selectedID
              }`}
            >
              {/* <Router> */}
              <div className={style["customer-data"]}>
                <div>
                  <Link
                    className={style["customer-name"]}
                    to={`/dietitian/${dietitianID}/customer/${
                      customerID ? customerID : selectedID
                    }`}
                  >
                    {users.length > 0 && customerID
                      ? users.filter((e) => e.id === customerID)[0].name
                      : ""}
                  </Link>
                </div>
                <div className={style["customer-dataSelect"]}>
                  <Link
                    className={style["link-select"]}
                    to={`/dietitian/${dietitianID}/customer/${
                      customerID ? customerID : selectedID
                    }/profile`}
                  >
                    基本資料
                  </Link>
                  <Link
                    className={style["link-select"]}
                    to={`/dietitian/${dietitianID}/customer/${
                      customerID ? customerID : selectedID
                    }/dietary`}
                  >
                    飲食記錄
                  </Link>
                  <Link
                    className={style["link-select"]}
                    to={`/dietitian/${dietitianID}/customer/${
                      customerID ? customerID : selectedID
                    }/target`}
                  >
                    目標設定
                  </Link>
                </div>
              </div>
              <Switch>
                <Route exact path={`/dietitian/:dID/customer/:cID/`}>
                  <div className={style["service-time"]}>
                    服務時間：{date.start ? date.start : ""}~
                    {date.end ? date.end : ""}
                  </div>
                </Route>
                <Route exact path={`/dietitian/:dID/customer/:cID/profile`}>
                  <div
                    id="customer-profile"
                    className={customer["customer-profile"]}
                  >
                    <div className={customer["profile-data"]}>
                      <CustomerProfile
                        props={props}
                        // id={selectedID}
                        input={input}
                      />
                    </div>
                  </div>
                </Route>
                <Route exact path={`/dietitian/:dID/customer/:cID/dietary`}>
                  <DietrayRecord />
                </Route>
                <Route exact path={`/dietitian/:dID/customer/:cID/target`}>
                  <DietitianTarget />
                </Route>
              </Switch>
              {/* </Router> */}
            </Route>
          </Switch>
        </main>
      </>
    );
  } else {
    return (
      <main className="d-main">
        <div style={{ marginLeft: "360px" }}>loading</div>
      </main>
    );
  }
}

export default Dietitian;
