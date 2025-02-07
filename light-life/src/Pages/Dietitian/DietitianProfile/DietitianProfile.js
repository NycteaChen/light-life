import React, { useState } from "react";
import { updateDietitianData, getImg } from "../../../utils/Firebase";
import style from "../../../style/dietitianProfile.module.scss";

function DietitianProfile({ profile, setProfile }) {
  const { name, image, id, gender, email, education, skills, other } = profile;
  const [isEditing, setIsEditing] = useState(false);
  const [edu, setEdu] = useState({
    school: education ? education.school : "",
    department: education ? education.department : "",
    degree: education ? education.degree : "",
  });
  const [skill, setSkill] = useState({
    threeHigh: skills ? skills.threeHigh : false,
    sportNT: skills ? skills.sportNT : false,
    weightControl: skills ? skills.weightControl : false,
    bloodSugar: skills ? skills.bloodSugar : false,
  });
  const [input, setInput] = useState({
    name: name,
    image: image,
    gender: gender ? gender : false,
    education: edu,
    skills: skill,
  });

  const getInputHandler = (e) => {
    const { name } = e.target;
    if (e.target.className === "education") {
      setEdu({ ...edu, [name]: e.target.value });
      setInput({ ...input, education: { ...edu, [name]: e.target.value } });
    } else if (name === "skills") {
      setSkill({ ...skill, [e.target.value]: !skill[e.target.value] });
      setInput({
        ...input,
        skills: { ...skill, [e.target.value]: !skill[e.target.value] },
      });
    } else if (name !== "image") {
      setInput({ ...input, [name]: e.target.value });
    } else if (e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(e.target.files[0]);
      fileReader.addEventListener("load", (a) => {
        setInput({
          ...input,
          imageFile: e.target.files[0],
          previewImg: a.target.result,
        });
      });
    } else {
      delete input.previewImg;
      delete input.imageFile;
      setInput({ ...input, image: input.image || image });
    }
  };

  const saveProfileHandler = async () => {
    if (input.imageFile) {
      const imageUrl = await getImg(input.imageFile, id);
      delete input.imageFile;
      delete input.previewImg;
      setInput({
        ...input,
        image: imageUrl,
      });
      updateDietitianData(id, {
        ...input,
        image: imageUrl,
      }).then(() => {
        setProfile({ ...profile, ...input, image: imageUrl });
        setIsEditing(false);
      });
    } else {
      setProfile({ ...profile, ...input });

      updateDietitianData(id, input).then(() => {
        setIsEditing(false);
      });
    }
  };

  const profileButtonHandler = (e) => {
    const { title } = e.target;
    switch (title) {
      case "cancel":
        setIsEditing(false);
        setInput({});
        break;
      case "edit":
        setIsEditing(true);
        break;
      default:
        break;
    }
  };
  return (
    <div className={style["dietitian-profile"]}>
      {isEditing ? (
        <div className={style["edit-mode"]}>
          <div className={style.buttons}>
            <button onClick={saveProfileHandler} title="save">
              <i className="fa fa-floppy-o" aria-hidden="true" title="save"></i>
            </button>
            <button onClick={profileButtonHandler} title="cancel">
              <i className="fa fa-times" aria-hidden="true" title="cancel"></i>
            </button>
          </div>
          {/*eslint-disable-next-line */}
          <form className={style["basic-profile"]} action="javascript:void(0)">
            <div className={style.flexbox}>
              <div className={style.img}>
                <a
                  href={input.previewImg || input.image || image}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={input.previewImg || input.image || image}
                    alt="profile"
                  />
                </a>

                <div>
                  <label htmlFor="image" className={style.uploadImg}>
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      name="image"
                      id="image"
                      onChange={getInputHandler}
                    />
                    <i className="fa fa-picture-o" aria-hidden="true"></i>
                  </label>
                </div>
              </div>
              <div>
                <div className={style.determined}>
                  <div className={style.title}>帳號</div>
                  <div className="email">{email}</div>
                </div>
                <div className={style.basic}>
                  <label className={style.title}>姓名</label>
                  <input
                    type="text"
                    name="name"
                    id={style.name}
                    required
                    value={
                      input.name || input.name === "" ? input.name : name || ""
                    }
                    onChange={getInputHandler}
                  />
                  <label className={style.title}>性別</label>
                  <div>
                    <input
                      type="radio"
                      name="gender"
                      value="男"
                      required
                      checked={
                        input.gender
                          ? input.gender === "男"
                            ? true
                            : false
                          : gender === "男"
                          ? true
                          : false
                      }
                      onChange={getInputHandler}
                    />
                    男
                    <input
                      type="radio"
                      name="gender"
                      value="女"
                      required
                      checked={
                        input.gender
                          ? input.gender === "女"
                            ? true
                            : false
                          : gender === "女"
                          ? true
                          : false
                      }
                      onChange={getInputHandler}
                    />
                    女
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className={style.education}>
                <label id={style.highestDegree} className={style.title}>
                  學歷
                </label>
                <div className={style["edu-select"]}>
                  <input
                    type="text"
                    className="education"
                    name="school"
                    placeholder="學校名稱"
                    value={edu.school || ""}
                    onChange={getInputHandler}
                    required
                  />
                  <input
                    type="text"
                    className="education"
                    placeholder="系所名稱"
                    name="department"
                    value={edu.department || ""}
                    onChange={getInputHandler}
                    required
                  />
                  <div>
                    <label>
                      <input
                        type="radio"
                        className="education"
                        name="degree"
                        value="學士"
                        onChange={getInputHandler}
                        required
                        checked={edu.degree === "學士" ? true : false}
                      />
                      學士
                    </label>
                    <label>
                      <input
                        type="radio"
                        className="education"
                        name="degree"
                        value="碩士"
                        onChange={getInputHandler}
                        required
                        checked={edu.degree === "碩士" ? true : false}
                      />
                      碩士
                    </label>
                    <label>
                      <input
                        type="radio"
                        className="education"
                        name="degree"
                        value="博士"
                        required
                        onChange={getInputHandler}
                        checked={edu.degree === "博士" ? true : false}
                      />
                      博士
                    </label>
                  </div>
                </div>
              </div>
              <div className={style.skills}>
                <label className={`${style.skill} ${style.title}`}>專長</label>
                <div className={style["select-skill"]}>
                  <label>
                    <input
                      type="checkbox"
                      name="skills"
                      value="weightControl"
                      onChange={getInputHandler}
                      checked={skill.weightControl || false}
                    />
                    體重管理
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="skills"
                      value="sportNT"
                      onChange={getInputHandler}
                      checked={skill.sportNT || false}
                    />
                    運動營養
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="skills"
                      value="bloodSugar"
                      onChange={getInputHandler}
                      checked={skill.bloodSugar || false}
                    />
                    血糖控制
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="skills"
                      value="threeHigh"
                      onChange={getInputHandler}
                      checked={skill.threeHigh || false}
                    />
                    三高控制
                  </label>
                </div>
              </div>

              <div className={style.other}>
                <label className={style.title}>其他</label>
                <textarea
                  cols="40"
                  rows="6"
                  name="other"
                  value={
                    input.other || input.other === ""
                      ? input.other
                      : other || ""
                  }
                  onChange={getInputHandler}
                ></textarea>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className={style["profile-data"]}>
          <div className={style.button}>
            <button onClick={profileButtonHandler} title="edit">
              <i
                title="edit"
                className="fa fa-pencil"
                aria-hidden="true"
                onClick={profileButtonHandler}
              ></i>
            </button>
          </div>
          {/*eslint-disable-next-line */}
          <form className={style["basic-profile"]} action="javascript:void(0);">
            <div className={style.flexbox}>
              <div className={style.img}>
                <a
                  href={input.previewImg || input.image || image}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={input.previewImg || input.image || image}
                    alt="profile"
                  />
                </a>
              </div>
              <div>
                <div className={style.determined}>
                  <div className={style.title}>帳號</div>
                  <div className="email">{email}</div>
                </div>
                <div className={style.basic}>
                  <label className={style.title}>姓名</label>
                  <div id={style.name}>
                    {input.name || input.name === "" ? input.name : name || ""}
                  </div>
                  <label className={style.title}>性別</label>
                  <div className={style.gender}>
                    {input.gender || gender || ""}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className={style.education}>
                <label id={style.highestDegree} className={style.title}>
                  學歷
                </label>
                <div className={style["edu-select"]}>
                  <div>{edu.school || ""}</div>
                  <div>{edu.department || ""}</div>
                  <div>{edu.degree || ""}</div>
                </div>
              </div>
              <div className={style.skills}>
                <label className={`${style.skill} ${style.title}`}>專長</label>
                <div className={style["select-skill"]}>
                  {skills && skills.weightControl ? (
                    <span>體重管理　</span>
                  ) : (
                    ""
                  )}
                  {skills && skills.sportNT ? <span>運動營養　</span> : ""}
                  {skills && skills.threeHigh ? <span>三高控制　</span> : ""}
                  {skills && skills.bloodSugar ? <span>血糖控制　</span> : ""}
                </div>
              </div>

              <div className={style.other}>
                <label className={style.title}>其他</label>
                <div>
                  {input.other || input.other === ""
                    ? input.other
                    : other || ""}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default DietitianProfile;
