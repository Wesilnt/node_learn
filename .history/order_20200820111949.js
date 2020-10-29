const order = require("./order/order");

const rememberMe = false;
const password_d = "Taimei@123";
const user_d = "lei.wu";

const getUser = () => {
  const paramArr = process.argv.splice(2);
  let username = paramArr[0] || user_d;
  let password = password_d;
  if (paramArr.length > 1) {
    password = paramArr[1];
  }

  console.log(`订餐者 : ${username}`);

  return {
    username,
    password,
    rememberMe,
  };
};

order(getUser()).then((res) => console.log(res));

function doMapping(input, ...mappings) {
  /**
   *
   * @param {*} sourece etrail tree
   * @param {*} target edc tree
   * @param {*} mapping  saved mapping
   *
   *
   * 1. get source data, it's a combination problem, form array * ig array
   *    if form is not repeated, the form array size =1, so it become 1*1
   *    also we need to consider range case
   *    if any null return value found in the path, we do a early return, quit the current method, leave a log
   *
   *    so finnaly, getter returns an array
   * 2. set, if path found, use it, else create
   *          path is actually original path + repeated no
   *          when not repeated, we just pick the first one, then drop every thing
   *
   * todo, value, type conversion,
   *
   */
  function doOneMapping(source, studyEventData, mapping) {
    let srcMapping = mapping.sourceList[0];
    let destMapping = mapping.target;

    let srcPathList = srcMapping.source.path.split(",");
    let srcVisitOid = srcPathList[0];
    console.log("src path", srcVisitOid);
    let srcFormOid = srcPathList[1];
    let srcIgOid = srcPathList[2];
    let srcItemOid = srcPathList[3];

    let destPathList = destMapping.path.split(",");
    let destVisitOid = destPathList[0];
    let destFormOid = destPathList[1];
    let destIgOid = destPathList[2];
    let destItemOid = destPathList[3];

    let visitList = source.subjects.visits.filter((v) => v.oid === srcVisitOid);
    /**
     * {
     *  forms:[
     *  { groups：[ {item}]}
     * ]
     *
     * }
     */
    let visit = visitList[0];
    let retrievedVisit = {};
    if (visitList.length > 0) {
      let formListCandidate = visit.forms.filter((f) => f.oid === srcFormOid);
      let formList = [];
      if (formListCandidate.length > 0) {
        //do range
        if (
          srcMapping.source["form"].isRepeat &&
          mapping.target["form"].isRepeat
        ) {
          let range = srcMapping.formRange;
          if (range.mode === "ALL") {
            formList = formListCandidate;
          } else if (range.mode === "INCLUDE") {
            formList = range.range.reduce((c, n) => {
              c = _.union(c, _.slice(formListCandidate, n.start - 1, n.end));
              return c;
            }, []);
          } else if (range.mode === "EXCLUDE") {
            let formExcludeList = range.range.reduce((c, n) => {
              c = _.union(c, _.slice(formListCandidate, n.start - 1, n.end));
              return c;
            }, []);
            formList = _.without(formListCandidate, ...formExcludeList);
          } else {
            formList = formListCandidate;
          }
          formList = formList.map((c, i) => {
            return { data: c, repeatNo: i + 1 };
          });
        } else {
          let single = {
            data: formListCandidate[0],
            repeatNo: mapping.target["form"].isRepeat ? 1 : 0,
          };
          formList = [single]; //drop everything else
        }
      }

      if (formList.length > 0) {
        retrievedVisit.forms = formList;
        for (let index = 0; index < formList.length; index++) {
          const form = formList[index];

          let groupListCandidate = form.data.groups.filter(
            (g) => g.groupOid === srcIgOid
          );
          if (
            groupListCandidate.length > 0 &&
            groupListCandidate[0].groupValues.length > 0
          ) {
            groupListCandidate = groupListCandidate[0].groupValues;
            let groupList = [];
            if (
              srcMapping.source["ig"].isRepeat &&
              mapping.target["ig"].isRepeat
            ) {
              let range = srcMapping.groupRange;
              if (range.mode === "ALL") {
                groupList = groupListCandidate;
              } else if (range.mode === "INCLUDE") {
                groupList = range.range.reduce((c, n) => {
                  c = _.union(
                    c,
                    _.slice(groupListCandidate, n.start - 1, n.end)
                  );
                  return c;
                }, []);
              } else if (range.mode === "EXCLUDE") {
                let groupExcludeList = range.range.reduce((c, n) => {
                  c = _.union(
                    c,
                    _.slice(groupListCandidate, n.start - 1, n.end)
                  );
                  return c;
                }, []);
                groupList = _.without(groupListCandidate, ...groupExcludeList);
              } else {
                groupList = groupListCandidate;
              }
              groupList = groupList.map((c, i) => {
                return { data: c, repeatNo: i + 1 };
              });
            } else {
              let single = {
                data: groupListCandidate[0],
                repeatNo: mapping.target["ig"].isRepeat ? 1 : 0,
              };
              groupList = [single]; //drop everything else
            }

            if (groupList.length > 0) {
              form.groups = groupList
                .map((g) => {
                  let items = g.data.items.filter(
                    (i) => i.itemName === srcItemOid
                  );
                  if (items.length == 0) return null;
                  return { item: items[0], ...g };
                })
                .filter((g) => g != null);
            } else {
              form.groups = [];
            }
          }
        }
      } else {
        retrievedVisit.forms = [];
      }
    }

    // a flat structure { visit:{ repeatNo }, form: { repeatNo}, ig:{  repeatNo }, item: { value,} }
    let retrievedArray = [];
    if (retrievedVisit.forms) {
      retrievedVisit.forms.forEach((f) => {
        if (f.groups) {
          f.groups.forEach((g) => {
            retrievedArray.push({
              formRepeatNo: f.repeatNo,
              igRepeatNo: g.repeatNo,
              item: g.item,
            });
          });
        }
      });
    }

    let destVisitListCandidate = studyEventData.filter(
      (v) => v.StudyEventOID === destVisitOid
    );
    let destVist = null;
    if (destVisitListCandidate.length === 0) {
      destVist = {
        StudyEventOID: destVisitOid, // 事件的OID
        StudyEventRepeatKey: destMapping["visit"].isRepeat ? 1 : 0, // 事件值的RepeatNo
        FormData: [],
      };
      studyEventData.push(destVist);
    } else {
      destVist = destVisitListCandidate[0];
    }

    retrievedArray.forEach((r) => {
      let formData = destVist.FormData;
      let destFormListCA = formData.filter(
        (f) => f.FormOID === destFormOid && f.FormRepeatKey === r.formRepeatNo
      );
      let destForm = null;
      if (destFormListCA.length > 0) {
        destForm = destFormListCA[0];
      } else {
        destForm = {
          FormOID: destFormOid,
          FormRepeatKey: r.formRepeatNo,
          ItemGroupData: [],
        };
        formData.push(destForm);
      }

      let igData = destForm.ItemGroupData;
      let destIgListCA = igData.filter(
        (ig) =>
          ig.ItemGroupOID === destIgOid && ig.ItemGroupRepeatKey == r.igRepeatNo
      );

      let destIg = null;
      if (destIgListCA.length > 0) {
        destIg = destIgListCA[0];
      } else {
        destIg = {
          ItemGroupOID: destIgOid, // 字段组的OID
          ItemGroupRepeatKey: r.igRepeatNo, // 字段组值的RepeatNo
          ItemData: [],
        };
        igData.push(destIg);
      }

      //TRY CONVERT HERE

      let val = r.item.rawValue;
      if (
        r.item.dataType === "datetime" ||
        r.item.dataType === "date" ||
        r.item.dataType === "TimePicker" ||
        r.item.dataType === "DatePicker" ||
        r.item.dataType === "ReferenceTime"
      ) {
        val = moment(parseInt(val)).format("YYYY-MM-DD HH:mm:ss");
      }

      if (
        srcMapping.dictMapping &&
        _.isArray(srcMapping.dictMapping) &&
        srcMapping.dictMapping.length > 0
      ) {
        for (let index = 0; index < srcMapping.dictMapping.length; index++) {
          const fromMap = srcMapping.dictMapping[index].source;
          if (fromMap === val) {
            val = srcMapping.dictMapping[index].target;
          }
        }
      }

      let itemData = {
        ItemOID: destItemOid,
        Value: val,
      };
      destIg.ItemData.push(itemData);
    });
  }

  let studyEventData = [];
  mappings.forEach((m) => {
    try {
      doOneMapping(global.etrialInput, studyEventData, m);
    } catch (ex) {
      console.log(ex.message, ex.stack);
    }
  });
  if (!global.edcSubject) {
    global.edcSubject = {};
  }
  global.edcSubject["StudyEventData"] = studyEventData;
  return global.edcOutput;
}

console.log(
  doMapping({
    projectId: "8a81c08b727f09ec0172a7170e8f6d29",
    siteId: "177e4276188f4a1eaed6a650001af23a",
    subjects: {
      screenNumber: "S088",
      visits: [
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "MH_IG81",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "未婚",
                          itemName: "MHMARRIGE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "未育",
                          itemName: "MHCHILD",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "MHPREGYN",
                          rawValue: "N",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "MH_IG82",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "MHMENSYN",
                          rawValue: "Y",
                        },
                        {
                          dataType: "Input",
                          itemName: "MHMENSSTART",
                          rawValue: "14",
                        },
                        {
                          dataType: "Input",
                          itemName: "MHMENSDUR",
                          rawValue: "4",
                        },
                        {
                          dataType: "Input",
                          itemName: "MHMENSPERI",
                          rawValue: "28",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "MHMENSLAST",
                          rawValue: "1595830938820",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH83",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "[避孕药, 杀精剂]",
                          itemName: "MHCONTRAMETHOD",
                          rawValue: "[7, 3]",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "婚育、月经史、避孕方式",
              oid: "F_MH8",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_DM",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "DatePicker",
                          itemName: "BRTHDAT",
                          rawValue: "922377600000",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "AGE",
                          rawValue: "21",
                        },
                        { dataType: "Select", itemName: "SEX", rawValue: "F" },
                        {
                          dataType: "Select",
                          itemName: "NATIONAL",
                          rawValue: "1",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "人口学信息",
              oid: "F_DM",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH71",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          itemName: "TXT",
                          rawValue:
                            "排除标准：每日吸烟量≥10支者；首次给药前3个月内经常饮酒者（每周饮酒超过21个单位，1单位含14g酒精\u003d360mL啤酒或45mL酒精量为40%的烈酒或150mL葡萄酒）",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "已经戒烟",
                          itemName: "MHSMOKEYN",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正在饮酒",
                          itemName: "MHDRINKYN",
                          rawValue: "2",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH72",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "MHSMOKETYPE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "MHSMOKENUM",
                          rawValue: "5",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "MHSMOKEQUITDATE",
                          rawValue: "2020-06-18 ::",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH73",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "啤酒",
                          itemName: "MHDRINKTYPE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "MHDRINKAMOUNT",
                          rawValue: "1",
                        },
                        { dataType: "TrialDate", itemName: "MHDRINKQUITDATE" },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "MH7SIG", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "烟酒史",
              oid: "F_MH7",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH41",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          rawValue:
                            "排除标准：首次给药前3个月内有献全血或失血≥400mL者，或有输血者；首次给药前1个月内有献血（含成分献血）或失血≥200mL者",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "MHYN",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH42",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "献血（全血）",
                          itemName: "MHBLOOD",
                          rawValue: "0",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "MHTIM",
                          rawValue: "2020-04-07 uk:uk:uk",
                        },
                        { dataType: "Input", rawValue: "200ml" },
                        { dataType: "Input", itemName: "COMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_MH43", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "献血、失血及接受血液制品史",
              oid: "F_MH4",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH51",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          rawValue:
                            "排除标准：首次给药前1个月内使用过任何处方药、中草药类补药、任何抑制或诱导肝脏对药物代谢的药物（如：诱导剂-巴比妥类、卡马西平、苯妥英钠、利福平和圣约翰草等；抑制剂-西咪替丁、环孢素、红霉素、维拉帕米、奎诺酮类、吡咯类抗真菌药（伊曲康唑、酮康唑）、HIV 蛋白酶抑制剂等），和/或首次给药前2周内使用过任何非处方药、食物补充剂（包括维生素、钙片等） ",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "MHYN",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH52",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MEDNAM",
                          rawValue: "阿司匹林片",
                        },
                        {
                          dataType: "Input",
                          itemName: "MEDREA",
                          rawValue: "头痛",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "口服",
                          itemName: "MEDMETH",
                          rawValue: "po",
                        },
                        {
                          dataType: "Input",
                          itemName: "MEDDOSE",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "每日一次",
                          itemName: "MEDFRE",
                          rawValue: "qd",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "MHSTTIM",
                          rawValue: "2020-06-02 uk:uk:uk",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "MEDSTILL",
                          rawValue: "N",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "MHENTIM",
                          rawValue: "2020-08-01 uk:uk:uk",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH53",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "THERNAM",
                          rawValue: "物理降温",
                        },
                        {
                          dataType: "Input",
                          itemName: "THERREA",
                          rawValue: "发热",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "单次",
                          itemName: "THERFRE",
                          rawValue: "oto",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "MHSTTIM",
                          rawValue: "2020-08-01 uk:uk:uk",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "THERSTILL",
                          rawValue: "N",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "MHENTIM",
                          rawValue: "2020-08-01 uk:uk:uk",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_MH54", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "用药/治疗史",
              oid: "F_MH5",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_RB1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "RBPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "RBTIM",
                          rawValue: "1594963392000",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_RB2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "中性粒细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "3.15",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[1.8",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "6.3]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "中性粒细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "63.7",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[40",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "75]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "单核细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.3",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.1",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.6]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "单核细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "6.1",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[3",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "10]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜碱性粒细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.03",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.06]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜碱性粒细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.7",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "1]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜酸细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "3",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.4",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "8]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜酸细胞计数",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.15",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.02",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.52]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "大血小板比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "20.2",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[13.9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "46.7]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均红细胞体积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "95.5",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "fL" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[82",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "100]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均血小板体积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "9.4",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "fL" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "17]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均血红蛋白浓度",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "329",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[316",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "354]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均血红蛋白量",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "31.4",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "pg" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[27",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "34]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "淋巴细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "1.31",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[1.1",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "3.2]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "淋巴细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "26.5",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[20",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "50]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "白细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "4.94",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[3.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "9.5]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 16,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "红细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "4.98",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^12/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[4.3",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "5.8]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 17,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "红细胞分布宽度CV",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "11.9",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "16.5]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 18,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "红细胞压积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "47.5",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[40",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "50]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 19,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血小板",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "197",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[125",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "350]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 20,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血小板分布宽度",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "16.2",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "fL" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "18.1]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 21,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血小板压积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.19",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.17",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.4]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 22,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血红蛋白",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "157",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[130",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "175]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 23,
                    },
                  ],
                },
              ],
              name: "血常规",
              oid: "F_RB",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_HW",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "HWTIM",
                          rawValue: "1597115322864",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "HEIGHT",
                          rawValue: "178",
                        },
                        {
                          dataType: "Select",
                          itemName: "HEIRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "WEIGHT",
                          rawValue: "69",
                        },
                        {
                          dataType: "Select",
                          itemName: "WEIRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BMI",
                          rawValue: "21.8",
                        },
                        {
                          dataType: "Select",
                          itemName: "BMIRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "HWCOMT" },
                        { dataType: "Input", itemName: "HEIGHTLL" },
                        { dataType: "Input", itemName: "HEIGHTUL" },
                        {
                          dataType: "Input",
                          itemName: "WEIGHTLL",
                          rawValue: "[45",
                        },
                        { dataType: "Input", itemName: "WEIGHTUL" },
                        {
                          dataType: "Input",
                          itemName: "BMILL",
                          rawValue: "[19",
                        },
                        {
                          dataType: "Input",
                          itemName: "BMIUL",
                          rawValue: "28]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "身高体重",
              oid: "F_HW",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_BT1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "BTPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "BTTIM",
                          rawValue: "1597198496776",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_BT2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BTPROJECTTEXT",
                          rawValue: "HIV",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BTRESULT",
                          rawValue: "0.060",
                        },
                        {
                          dataType: "Input",
                          itemName: "BTUNIT",
                          rawValue: "S/CO",
                        },
                        { dataType: "Input", itemName: "BTRESULTLL" },
                        {
                          dataType: "Input",
                          itemName: "BTRESULTUL",
                          rawValue: "1.00]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BTEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BTCOMT" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BTPROJECTTEXT",
                          rawValue: "丙型肝炎病毒抗体",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BTRESULT",
                          rawValue: "0.080",
                        },
                        {
                          dataType: "Input",
                          itemName: "BTUNIT",
                          rawValue: "S/CO",
                        },
                        { dataType: "Input", itemName: "BTRESULTLL" },
                        {
                          dataType: "Input",
                          itemName: "BTRESULTUL",
                          rawValue: "1.00]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BTEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BTCOMT" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BTPROJECTTEXT",
                          rawValue: "乙肝表面抗原",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BTRESULT",
                          rawValue: "\u003c0.05",
                        },
                        {
                          dataType: "Input",
                          itemName: "BTUNIT",
                          rawValue: "IU/mL",
                        },
                        { dataType: "Input", itemName: "BTRESULTLL" },
                        {
                          dataType: "Input",
                          itemName: "BTRESULTUL",
                          rawValue: "0.08]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BTEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BTCOMT" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BTPROJECTTEXT",
                          rawValue: "梅毒螺旋体抗体",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BTRESULT",
                          rawValue: "0.1",
                        },
                        {
                          dataType: "Input",
                          itemName: "BTUNIT",
                          rawValue: "S/CO",
                        },
                        { dataType: "Input", itemName: "BTRESULTLL" },
                        {
                          dataType: "Input",
                          itemName: "BTRESULTUL",
                          rawValue: "1.00]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BTEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BTCOMT" },
                      ],
                      seq: 4,
                    },
                  ],
                },
              ],
              name: "血清病毒学检查",
              oid: "F_BT",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_PE1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "PEPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PETIM",
                          rawValue: "1597115773873",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_PE2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "16",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "6",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "7",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "8",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "9",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "PECLSIG",
                          rawValue: "1",
                        },
                        {
                          dataType: "Input",
                          itemName: "PEDESC",
                          rawValue: "右下腹手术疤痕3cm",
                        },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "13",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "10",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "14",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "11",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "15",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "3",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 14,
                    },
                  ],
                },
              ],
              name: "体格检查",
              oid: "F_PE",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_PG",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "PGPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PGTIM",
                          rawValue: "1597313489276",
                        },
                        {
                          dataType: "Input",
                          itemName: "PGPROJECTTEXT",
                          rawValue: "绒毛膜促性腺激素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "PGRESULT",
                          rawValue: "\u003c1",
                        },
                        {
                          dataType: "Input",
                          itemName: "PGRESULTLL",
                          rawValue:
                            "健康绝经后妇女≤7\n健康非孕绝经前妇女≤1\t\n孕妇孕3周:5.4–72\n孕4周:10.2–708\n孕5周:217–8245\n孕6周：152–32177\t\n孕7周：4059–153767\n孕8",
                        },
                        {
                          dataType: "Input",
                          itemName: "PGRESULTUL",
                          rawValue: "9周：3",
                        },
                        { dataType: "Input", itemName: "PGCOMT" },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "妊娠检查",
              oid: "F_PG",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_ICF3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "SUBSTA",
                          rawValue: "5",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "ICFDATE",
                          rawValue: "1597115301603",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "ICFYN1",
                          rawValue: "Y",
                        },
                        {
                          dataType: "Select",
                          itemName: "ICFKNOW",
                          rawValue: "Y",
                        },
                        {
                          dataType: "Input",
                          itemName: "ICFVER",
                          rawValue: "1.0",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_ICF4", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "知情同意",
              oid: "F_ICF",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_EC",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "ECSTPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "ECTIM",
                          rawValue: "1597197975915",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "ECDE",
                          rawValue: "1",
                        },
                        {
                          dataType: "TextArea",
                          itemName: "ECDIAG",
                          rawValue: "窦性心动过缓",
                        },
                        { dataType: "Upload", itemName: "ECIMG" },
                        { dataType: "Input", itemName: "ECCOMT" },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "心电图",
              oid: "F_EC",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_UR1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "URPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "URTIM",
                          rawValue: "1594958496000",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_UR2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "PH",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "7.0",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[5.0",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "8.0]",
                        },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "亚硝酸",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "尿胆原",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "弱阳性(+-)",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "比重",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "1.010",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[1.005",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "1.030]",
                        },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "潜血",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "白细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "+-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "UREVA",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "白细胞镜检",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "/HP",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "5]",
                        },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "管型",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "/LP",
                        },
                        { dataType: "Input", itemName: "URRESULTLL" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "红细胞镜检",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "/HP",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "3]",
                        },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "维 C",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "胆红素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "葡萄糖",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "蛋白质",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "透明度",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "清",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTLL" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "酮体",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "颜色",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "黄色",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTLL" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 16,
                    },
                  ],
                },
              ],
              name: "尿常规",
              oid: "F_UR",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_IE33",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "SUBSTA",
                          rawValue: "5",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "IEYN",
                          rawValue: "Y",
                        },
                        { dataType: "TextArea", itemName: "IECOMT" },
                        {
                          dataType: "Select",
                          itemName: "SCRSAE",
                          rawValue: "N",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_IE34", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "初步入排标准",
              oid: "F_IE3",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_BB1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "BBPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "BBTIM",
                          rawValue: "1594967199000",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_BB2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "尿素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "3.33",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[2.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "8.2]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "总胆红素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "12.3",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "μmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "20.4]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "总蛋白",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "74.2",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[64",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "83]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "氯",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "99.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[95",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "107]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "白蛋白",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "45.9",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[35",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "55]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "肌酐",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "75",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "μmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[41",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "115]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "葡萄糖",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "3.63",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[3.9",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "6.1]",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，有临床意义",
                          itemName: "BBEVA",
                          rawValue: "2",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "谷丙转氨酶",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "11",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "U/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "40]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "谷草转氨酶",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "15",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "U/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[8",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "40]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "钠",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "137",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[136",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "145]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "钾",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "4.2",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[3.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "5.3]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 11,
                    },
                  ],
                },
              ],
              name: "血生化",
              oid: "F_BB",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH21",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          rawValue:
                            "排除标准：有任何可能影响受试者参加试验的安全性或试验药物体内过程的疾病史，包括中枢神经系统、心血管系统、消化系统、呼吸系统、泌尿系统、血液系统、免疫学、精神病学及代谢异常等疾病史，或能干扰试验结果的任何其他疾病（如：已知的主动脉瓣狭窄、严重出血倾向、半乳糖不耐受症、乳糖酶缺乏症、葡萄糖-半乳糖吸收不良、目前正患有牙龈炎或牙周炎等）",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "MHYN",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH22",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "NAME",
                          rawValue: "急性阑尾炎",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "STARDAT",
                          rawValue: "2000-01-01 uk:uk:uk",
                        },
                        {
                          dataType: "Input",
                          itemName: "SURGNAME",
                          rawValue: "阑尾切除术",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "SURGDATE",
                          rawValue: "2000-01-01 uk:uk:uk",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "CURRSTA",
                          rawValue: "N",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "CURETIM",
                          rawValue: "2000-01-01 uk:uk:uk",
                        },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_MH23", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "疾病史及手术史",
              oid: "F_MH2",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue:
                            "首次给药前 3个月内是否参加过其它临床试验并接受过试验药物？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue: "是否有药物滥用史？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue:
                            "是否不能遵守统一饮食（如不能进食高脂高热饮食）？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue:
                            "是否既往长期饮用过量（一天8杯以上，1杯\u003d250 mL）茶、咖啡或含咖啡因的饮料？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue: "是否采血困难？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue:
                            "在试验期间及末次服药后3个月内是否有育儿计划、捐精/捐卵计划或不能采取可靠的避孕措施?",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 6,
                    },
                  ],
                },
                { groupOid: "IG_MH32", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "健康状况调查",
              oid: "F_MH3",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_ED1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          rawValue:
                            "研究人员向受试者详细介绍本试验的目的、试验药物信息、试验过程、参加本试验可能出现的风险和不适、参与和退出的权益、参加本试验的义务、保密原则和参加本试验的补贴等，并给予受试者充分的时间和机会询问试验的细节和考虑是否参加试验。",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EDBETIM",
                          rawValue: "1597111440000",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EDENDTIM",
                          rawValue: "1597115277045",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_ED2", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "知情同意内容宣教记录",
              oid: "F_ED",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_ST",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "ReferenceTime",
                          itemName: "STTIM",
                          rawValue: "1597733909868",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正常",
                          itemName: "STEVA",
                          rawValue: "0",
                        },
                        { dataType: "TextArea", itemName: "STRESULT" },
                        { dataType: "Input", itemName: "STCOMT" },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "胸片",
              oid: "F_ST",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH11",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          rawValue:
                            "包括药物和非药物，如酒精、海鲜、花粉、青霉素等，如有过敏史请询问并详细记录情况。排除标准：已知对试验制剂及其任何成分或相关制剂有过敏史者或过敏体质者",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "MHYN",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_MH12",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "ALLE",
                          rawValue: "青霉素",
                        },
                        {
                          dataType: "Input",
                          itemName: "CMT",
                          rawValue: "2005年青霉素过敏",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_MH13", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "过敏史",
              oid: "F_MH1",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "QURECORD",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "QUTIME",
                          rawValue: "1597126995617",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "QUTABLE",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正确",
                          itemName: "QURESULT",
                          rawValue: "0",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "4",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "5",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "6",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正确",
                          itemName: "QURESULT",
                          rawValue: "0",
                        },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "7",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "8",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "9",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正确",
                          itemName: "QURESULT",
                          rawValue: "0",
                        },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "10",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "11",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "12",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "13",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正确",
                          itemName: "QURESULT",
                          rawValue: "0",
                        },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "14",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "15",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 16,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "16",
                        },
                        {
                          dataType: "Select",
                          itemName: "QURESULT",
                          rawValue: "2",
                        },
                      ],
                      seq: 17,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "QUOPTION",
                          rawValue: "17",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正确",
                          itemName: "QURESULT",
                          rawValue: "0",
                        },
                      ],
                      seq: 18,
                    },
                  ],
                },
              ],
              name: "受试者知情同意书知晓情况问卷表",
              oid: "F_QU",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_VS1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "InputNumber", itemName: "SEQ" },
                        { dataType: "DatePicker", itemName: "VSPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSTIM",
                          rawValue: "1597115436475",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSSYPR",
                          rawValue: "123",
                        },
                        {
                          dataType: "Select",
                          itemName: "VAARANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSDIPR",
                          rawValue: "86",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSPULSE",
                          rawValue: "65",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPULSEDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSTEMP",
                          rawValue: "36.8",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSREDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "Select",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "生命体征",
              oid: "F_VS1",
              seq: 0,
            },
          ],
          oid: "SCRN",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_FA",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "FATIM",
                          rawValue: "1597198576587",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "禁食记录",
              oid: "F_FA",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_IG",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "R01",
                          itemName: "RANDNUM",
                          rawValue: "R01",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "RANDSEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "SUBSTA",
                          rawValue: "5",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "RANDDTC",
                          rawValue: "1597124562273",
                        },
                        {
                          dataType: "Select",
                          itemName: "RANDRES",
                          rawValue: "B",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "IEYN",
                          rawValue: "Y",
                        },
                        { dataType: "TextArea", itemName: "IECOMT" },
                        {
                          dataType: "DatePicker",
                          itemName: "TRSTDA",
                          rawValue: "1597210966782",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_IG2", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "入组信息",
              oid: "F_IG",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_IH",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "IHTIM",
                          rawValue: "1597116047240",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "入住登记",
              oid: "F_IH",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_HW",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "HWTIM",
                          rawValue: "1597115951908",
                        },
                        { dataType: "ReferenceResult", itemName: "HEIGHT" },
                        {
                          dataType: "Select",
                          itemName: "HEIRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "WEIGHT",
                          rawValue: "69",
                        },
                        {
                          dataType: "Select",
                          itemName: "WEIRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "ReferenceResult", itemName: "BMI" },
                        {
                          dataType: "Select",
                          itemName: "BMIRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Input", itemName: "HWCOMT" },
                        { dataType: "Input", itemName: "HEIGHTLL" },
                        { dataType: "Input", itemName: "HEIGHTUL" },
                        {
                          dataType: "Input",
                          itemName: "WEIGHTLL",
                          rawValue: "[45",
                        },
                        { dataType: "Input", itemName: "WEIGHTUL" },
                        {
                          dataType: "Input",
                          itemName: "BMILL",
                          rawValue: "[19",
                        },
                        {
                          dataType: "Input",
                          itemName: "BMIUL",
                          rawValue: "28]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "身高体重",
              oid: "F_HW",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue:
                            "首次给药前48 h 内，是否摄入任何含有咖啡因、 葡萄柚、罂粟的食物或饮料（如咖啡、酒、浓茶、巧克力、葡萄柚、 柚子等）？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue: "病史是否有更新？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue: "是否出现新的不良事件？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue: "是否有新的合并用药/治疗？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 4,
                    },
                  ],
                },
                { groupOid: "IG_MH32", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "健康状况调查",
              oid: "F_MH3",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_IE11",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          itemName: "IEEXPL",
                          rawValue:
                            "以下标准有选择“否”的受试者不能继续参加本临床研究。",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_IE12",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "能够和研究人员进行良好地沟通、充分理解本试验的目的并理解和遵守该试验 的各项要求，自愿参加临床试验并签署书面知情同意书；",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue: "18 周岁≤年龄≤45 周岁，男性或女性； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "Y",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "体重：男性≥50kg 或女性≥45kg；体重指数［BMI\u003d体重(kg)/身高(m)2］在 19-28 kg/m2之间（包括边界值）； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "Y",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "体格检查、生命体征检查、实验室检查（血常规、尿常规、血生化）、12 导联 心电图检查、胸部 X 线（后前位）检查结果正常或异常无临床意义",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "Y",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "乙肝表面抗原（HBsAg）、丙肝病毒抗体（HCV-Ab）、人类免疫缺陷病毒抗体 （HIV-Ab）、梅毒螺旋体抗体检查结果呈阴性； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "Y",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "同意在试验期间及末次服药后 3 个月内无育儿计划、无捐精/捐卵计划且能采取 可靠的避孕措施。",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "Y",
                        },
                      ],
                      seq: 6,
                    },
                  ],
                },
                { groupOid: "IG_IE13", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "入选标准",
              oid: "F_IE1",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_SE",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "SETEST",
                          rawValue: "0",
                        },
                        { dataType: "TimePicker", itemName: "SEURTIM" },
                        { dataType: "TimePicker", itemName: "SEBETIM" },
                        {
                          dataType: "TimePicker",
                          itemName: "SERETIM",
                          rawValue: "1597115994463",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "阴性",
                          itemName: "SERESU",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "特殊测试",
              oid: "F_SE",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_IE21",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Notice",
                          itemName: "IEEXPL",
                          rawValue:
                            "以下标准有选择“是”的受试者不能继续参加本临床研究。",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_IE22",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "已知对试验制剂及其任何成分或相关制剂有过敏史者或过敏体质者； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "有任何可能影响受试者参加试验的安全性或试验药物体内过程的疾病史，包括 中枢神经系统、心血管系统、消化系统、呼吸系统、泌尿系统、血液系统、免 疫学、精神病学及代谢异常等疾病史，或能干扰试验结果的任何其他疾病（如： 已知的主动脉瓣狭窄、严重出血倾向、半乳糖不耐受症、乳糖酶缺乏症、葡萄 糖-半乳糖吸收不良、目前正患有牙龈炎或牙周炎等）； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "体位性低血压的受试者，体位性低血压定义为仰卧位至少 5 分钟后起立，第一 个 3 分钟内收缩压下降\u003e20mmHg，或者舒张压下降\u003e10mmHg； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "采血困难者或不能遵守统一饮食（如不能进食高脂高热饮食）者； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "既往长期饮用过量（一天 8 杯以上，1 杯\u003d250mL）茶、咖啡或含咖啡因的饮料 者；或首次给药前 48h 内，摄入任何含有咖啡因、葡萄柚、罂粟的食物或饮料 （如咖啡、酒、浓茶、巧克力、葡萄柚、柚子等）者；",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "酒精呼气检测结果阳性，或首次给药前 3 个月内经常饮酒者（每周饮酒超过 21 个单位， 1单位含14g酒精\u003d360mL啤酒或45mL酒精量为40%的烈酒或150mL 葡萄酒）； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue: "每日吸烟量≥10 支者； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "有药物滥用史、药物依赖史者，或尿药物滥用筛查（吗啡、四氢大麻酚酸、甲 基安非他明、二亚甲基双氧安非他明、氯胺酮和可卡因）阳性者； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "首次给药前 1 个月内使用过任何处方药、中草药类补药、任何抑制或诱导肝脏 对药物代谢的药物（如：诱导剂-巴比妥类、卡马西平、苯妥英钠、利福平和圣 约翰草等；抑制剂-西咪替丁、环孢素、红霉素、维拉帕米、奎诺酮类、吡咯类 抗真菌药（伊曲康唑、酮康唑）、HIV 蛋白酶抑制剂等），和/或首次给药前 2 周内使用过任何非处方药、食物补充剂（包括维生素、钙片等）； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "首次给药前 3 个月内参加过其它临床试验并接受过试验药物者；",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "首次给药前 3 个月内有献全血或失血≥400mL 者，或有输血者；首次给药前 1 个月内有献血（含成分献血）或失血≥200mL 者； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "妊娠检查阳性者或哺乳期女性（女性受试者适用）； ",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "IETEST",
                          rawValue:
                            "经研究人员判断，有不适合参加本试验的其它因素者。",
                        },
                        {
                          dataType: "Select",
                          itemName: "IEORRES",
                          rawValue: "N",
                        },
                      ],
                      seq: 13,
                    },
                  ],
                },
                {
                  groupOid: "IG_IE23",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "SUBSTA",
                          rawValue: "5",
                        },
                        { dataType: "Select", itemName: "IEYN" },
                        { dataType: "TextArea", itemName: "IECOMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_IE24", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "排除标准",
              oid: "F_IE2",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_ST",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "ReferenceTime",
                          itemName: "STTIM",
                          rawValue: "1597198556563",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正常",
                          itemName: "STEVA",
                          rawValue: "0",
                        },
                        { dataType: "TextArea", itemName: "STRESULT" },
                        { dataType: "Input", itemName: "STCOMT" },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "胸片",
              oid: "F_ST",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_VS1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597075200000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSTIM",
                          rawValue: "1597116415690",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSSYPR",
                          rawValue: "118",
                        },
                        {
                          dataType: "Select",
                          itemName: "VAARANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSDIPR",
                          rawValue: "75",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSPULSE",
                          rawValue: "66",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPULSEDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSTEMP",
                          rawValue: "37.1",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSREDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597075200000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597161600999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "生命体征",
              oid: "F_VS1",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_PE1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "PEPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PETIM",
                          rawValue: "1597733974259",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_PE2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "一般状况",
                          itemName: "PETEST",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "皮肤黏膜",
                          itemName: "PETEST",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "淋巴结",
                          itemName: "PETEST",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "眼耳鼻喉",
                          itemName: "PETEST",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "头颈部",
                          itemName: "PETEST",
                          rawValue: "16",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "甲状腺",
                          itemName: "PETEST",
                          rawValue: "6",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "PECLSIG",
                          rawValue: "1",
                        },
                        {
                          dataType: "Input",
                          itemName: "PEDESC",
                          rawValue: "甲状腺肿大",
                        },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "胸/肺部",
                          itemName: "PETEST",
                          rawValue: "7",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "心脏",
                          itemName: "PETEST",
                          rawValue: "8",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "腹部",
                          itemName: "PETEST",
                          rawValue: "9",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "背部",
                          itemName: "PETEST",
                          rawValue: "13",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "骨骼肌肉系统",
                          itemName: "PETEST",
                          rawValue: "10",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "脊柱与四肢",
                          itemName: "PETEST",
                          rawValue: "14",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "神经系统",
                          itemName: "PETEST",
                          rawValue: "11",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "其他检查",
                          itemName: "PETEST",
                          rawValue: "15",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "3",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 14,
                    },
                  ],
                },
              ],
              name: "体格检查",
              oid: "F_PE",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "UDASRECORD",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "UDASURTIM",
                          rawValue: "1597116024938",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "UDASBETIM",
                          rawValue: "1597116120000",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "UDASRETIM",
                          rawValue: "1597116536318",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "UDASTABLE",
                  groupValues: [
                    {
                      items: [
                        { dataType: "Select", itemName: "CHIT", rawValue: "0" },
                        { dataType: "Select", itemName: "CHRE", rawValue: "1" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        { dataType: "Select", itemName: "CHIT", rawValue: "1" },
                        { dataType: "Select", itemName: "CHRE", rawValue: "1" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        { dataType: "Select", itemName: "CHIT", rawValue: "2" },
                        { dataType: "Select", itemName: "CHRE", rawValue: "1" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        { dataType: "Select", itemName: "CHIT", rawValue: "3" },
                        { dataType: "Select", itemName: "CHRE", rawValue: "1" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        { dataType: "Select", itemName: "CHIT", rawValue: "4" },
                        { dataType: "Select", itemName: "CHRE", rawValue: "1" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        { dataType: "Select", itemName: "CHIT", rawValue: "5" },
                        { dataType: "Select", itemName: "CHRE", rawValue: "1" },
                      ],
                      seq: 6,
                    },
                  ],
                },
              ],
              name: "尿药物滥用筛查",
              oid: "F_UDAS",
              seq: 0,
            },
          ],
          oid: "V1D0",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_AE1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "AEYN",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_AE2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "AENAME",
                          rawValue: "中性粒细胞升高",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "AESTTIM",
                          rawValue: "2020-08-16 10:UK:UK",
                        },
                        {
                          dataType: "TrialDate",
                          itemName: "AEENTIM",
                          rawValue: "UK-UK-UK UK:UK:UK",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "痊愈",
                          itemName: "AEEND",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "2级",
                          itemName: "AEINTE",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "[试验结束]",
                          itemName: "AEDRME",
                          rawValue: "[2]",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "未采取措施",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "可能无关",
                          itemName: "AETRDRRE",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "AESYN",
                          rawValue: "N",
                        },
                        { dataType: "Select", itemName: "AESAEDET" },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "AEQUITYN",
                          rawValue: "N",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_AE3", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "不良事件",
              oid: "F_AE",
              seq: 0,
            },
            {
              groups: [
                {
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "OBTIME",
                          rawValue: "1597736112971",
                        },
                        {
                          dataType: "TextArea",
                          rawValue:
                            "受试者今日出院血常规示中性粒细胞75.4*10^9/L，无不适主诉，随访复查。",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "临床观察记录",
              oid: "F_OB",
              seq: 0,
            },
          ],
          oid: "AE",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_EA1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "DatePicker",
                          itemName: "EAPTIM",
                          rawValue: "1597204823501",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAPHSTIM",
                          rawValue: "1597204823501",
                        },
                        {
                          dataType: "Select",
                          itemName: "EAMETY",
                          rawValue: "1",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EATIM",
                          rawValue: "1597204860050",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAENTIM",
                          rawValue: "1597205778814",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "EAYN",
                          rawValue: "N",
                        },
                        { dataType: "Input", itemName: "EARICE" },
                        {
                          dataType: "Input",
                          itemName: "EAVEGE",
                          rawValue: "20%大白菜",
                        },
                        { dataType: "Input", itemName: "EACOMT" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "DatePicker",
                          itemName: "EAPTIM",
                          rawValue: "1597226423501",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAPHSTIM",
                          rawValue: "1597226423501",
                        },
                        {
                          dataType: "Select",
                          itemName: "EAMETY",
                          rawValue: "2",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EATIM",
                          rawValue: "1597226412898",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAENTIM",
                          rawValue: "1597227681976",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "EAYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "EARICE" },
                        { dataType: "Input", itemName: "EAVEGE" },
                        { dataType: "Input", itemName: "EACOMT" },
                      ],
                      seq: 2,
                    },
                  ],
                },
              ],
              name: "标准餐发餐记录",
              oid: "F_EA",
              seq: 0,
            },
            {
              groups: [
                {
                  groupValues: [
                    {
                      items: [
                        { dataType: "Select", itemName: "WRYN", rawValue: "Y" },
                        { dataType: "Input", itemName: "WRCMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "禁水记录",
              oid: "F_WR",
              seq: 0,
            },
            {
              groups: [
                {
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "UBSYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "UBSCMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "上半身直立",
              oid: "F_UBS",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_EX1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "EXROUTE",
                          rawValue: "2",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_EX2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "EX2_PRTRNU" },
                        { dataType: "Select", itemName: "EXNUM" },
                        { dataType: "Select", itemName: "EXPOSI" },
                        { dataType: "Select", itemName: "EXVOMEYN" },
                        {
                          dataType: "TimePicker",
                          itemName: "EXSTPTIM",
                          rawValue: "1597190400000",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "REEXSTPTIM",
                          rawValue: "1597190400000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "EXSTTIM",
                          rawValue: "1597190423501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "EXENTIM",
                          rawValue: "1597190455501",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText:
                            "非洛地平缓释片（参比制剂，波依定®）",
                          itemName: "EXSPEC",
                          rawValue: "1",
                        },
                        { dataType: "Input", rawValue: "1片（5mg）" },
                        {
                          dataType: "InputNumber",
                          itemName: "EXWATER",
                          rawValue: "240",
                        },
                        {
                          dataType: "Select",
                          itemName: "EXCHMOYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "EXCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597186800000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597194000999]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "给药记录",
              oid: "F_EX",
              seq: 0,
            },
          ],
          oid: "V1D1",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_VS3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药前1h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597190423501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597190415874",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "120",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "74",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "69",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "36.1",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597186823000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597190423999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "2",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后3h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597201223501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597201235409",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "118",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "65",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "67",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "36.6",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "左臂",
                          itemName: "VSARM",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597199423000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597203023999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "3",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后5h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597208423501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597208437601",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "121",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "68",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "94",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "36.9",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597206623000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597210223999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "4",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后24h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597276823501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597276830119",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "110",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "74",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "79",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "36.4",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597275023000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597278623999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后48h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597363223501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597363226690",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "110",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "69",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "87",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "36.2",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597359623000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597366823999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "6",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后72h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597449623501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597449623104",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "107",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "68",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "79",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "36.2",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597446023000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597453223999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 6,
                    },
                  ],
                },
              ],
              name: "生命体征（试验期）",
              oid: "F_VS3",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_PC1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PCPBLCO",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCHETUTY",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCPRRE",
                          rawValue: "1",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_PC2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "1",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597190423501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597189845166",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597189861144",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597186823000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597190423999]",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "2",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597192223501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597192226446",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597192240802",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597192103000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597192343999]",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "3",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597194023501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597194028389",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597194051850",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597193903000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597194143999]",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "4",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "4",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597195823501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597195813775",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597195832524",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597195703000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597195943999]",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "5",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "5",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597197623501",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597197618533",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597197633462",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597197503000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597197743999]",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "6",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "6",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597199423501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597199303000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597199543999]",
                        },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "7",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "7",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597201223501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597201103000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597201343999]",
                        },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "8",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "8",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597203023501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597202903000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597203143999]",
                        },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "9",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "9",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597204823501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597204703000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597204943999]",
                        },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "10",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "10",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597206623501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597206503000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597206743999]",
                        },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "11",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "11",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597208423501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597208303000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597208543999]",
                        },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "12",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "12",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597210223501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597210103000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597210343999]",
                        },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "13",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "13",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597212023501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597211903000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597212143999]",
                        },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "14",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "14",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597213823501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597213703000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597213943999]",
                        },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "15",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "15",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597215623501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597215503000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597215743999]",
                        },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "16",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "16",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597219223501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597219103000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597219343999]",
                        },
                      ],
                      seq: 16,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "17",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "17",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597226423501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597226123000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597226723999]",
                        },
                      ],
                      seq: 17,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "18",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "18",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597233623501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597233323000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597233923999]",
                        },
                      ],
                      seq: 18,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "19",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "19",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597240823501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597240523000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597241123999]",
                        },
                      ],
                      seq: 19,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "20",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "20",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597276823501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597276223000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597277423999]",
                        },
                      ],
                      seq: 20,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "21",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "21",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597363223501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597362623000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597363823999]",
                        },
                      ],
                      seq: 21,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "22",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "22",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597449623501",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597449023000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597450223999]",
                        },
                      ],
                      seq: 22,
                    },
                  ],
                },
              ],
              name: "血样采集记录(PK)",
              oid: "F_PC",
              seq: 0,
            },
          ],
          oid: "V1D4",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_FA",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "FATIM",
                          rawValue: "1597198655473",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "禁食记录",
              oid: "F_FA",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_MH3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue:
                            "此次给药前48 h 内，是否摄入任何含有咖啡因、 葡萄柚、罂粟的食物或饮料（如咖啡、酒、浓茶、巧克力、葡萄柚、 柚子等）？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "MHCAT",
                          rawValue: "病史是否有更新？",
                        },
                        { dataType: "Select", itemName: "MHYN", rawValue: "N" },
                        { dataType: "Input", itemName: "MHCOMT" },
                      ],
                      seq: 2,
                    },
                  ],
                },
                { groupOid: "IG_MH32", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "健康状况调查",
              oid: "F_MH3",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_SE",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "SETEST",
                          rawValue: "0",
                        },
                        { dataType: "TimePicker", itemName: "SEURTIM" },
                        { dataType: "TimePicker", itemName: "SEBETIM" },
                        { dataType: "TimePicker", itemName: "SERETIM" },
                        { dataType: "Select", itemName: "SERESU" },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "特殊测试",
              oid: "F_SE",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_VS1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597680000000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSTIM",
                          rawValue: "1597734620869",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSSYPR",
                          rawValue: "122",
                        },
                        {
                          dataType: "Select",
                          itemName: "VAARANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSDIPR",
                          rawValue: "78",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSPULSE",
                          rawValue: "66",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPULSEDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "VSTEMP",
                          rawValue: "37.1",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSREDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597680000000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597766400999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "生命体征",
              oid: "F_VS1",
              seq: 0,
            },
          ],
          oid: "V2D0",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_EA1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "DatePicker",
                          itemName: "EAPTIM",
                          rawValue: "1597809610548",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAPHSTIM",
                          rawValue: "1597809610548",
                        },
                        {
                          dataType: "Select",
                          itemName: "EAMETY",
                          rawValue: "1",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EATIM",
                          rawValue: "1597809604702",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAENTIM",
                          rawValue: "1597810571979",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "EAYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "EARICE" },
                        { dataType: "Input", itemName: "EAVEGE" },
                        { dataType: "Input", itemName: "EACOMT" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "DatePicker",
                          itemName: "EAPTIM",
                          rawValue: "1597831210548",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAPHSTIM",
                          rawValue: "1597831210548",
                        },
                        {
                          dataType: "Select",
                          itemName: "EAMETY",
                          rawValue: "2",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EATIM",
                          rawValue: "1597831227164",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "EAENTIM",
                          rawValue: "1597832376280",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "否",
                          itemName: "EAYN",
                          rawValue: "N",
                        },
                        { dataType: "Input", itemName: "EARICE" },
                        {
                          dataType: "Input",
                          itemName: "EAVEGE",
                          rawValue: "20%青豆虾仁",
                        },
                        { dataType: "Input", itemName: "EACOMT" },
                      ],
                      seq: 2,
                    },
                  ],
                },
              ],
              name: "标准餐发餐记录",
              oid: "F_EA",
              seq: 0,
            },
            {
              groups: [
                {
                  groupValues: [
                    {
                      items: [
                        { dataType: "Select", itemName: "WRYN", rawValue: "Y" },
                        { dataType: "Input", itemName: "WRCMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "禁水记录",
              oid: "F_WR",
              seq: 0,
            },
            {
              groups: [
                {
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "UBSYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "UBSCMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "上半身直立",
              oid: "F_UBS",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_EX1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "EXROUTE",
                          rawValue: "2",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_EX2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "EX2_PRTRNU" },
                        { dataType: "Select", itemName: "EXNUM" },
                        { dataType: "Select", itemName: "EXPOSI" },
                        { dataType: "Select", itemName: "EXVOMEYN" },
                        {
                          dataType: "TimePicker",
                          itemName: "EXSTPTIM",
                          rawValue: "1597795200000",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "REEXSTPTIM",
                          rawValue: "1597795200000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "EXSTTIM",
                          rawValue: "1597795210548",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "EXENTIM",
                          rawValue: "1597795245962",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText:
                            "非洛地平缓释片（受试制剂，波啡克®）",
                          itemName: "EXSPEC",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "EXWATER",
                          rawValue: "240",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "EXCHMOYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "EXCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597791600000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597798800999]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "给药记录",
              oid: "F_EX",
              seq: 0,
            },
          ],
          oid: "V2D1",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_VS3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药前1h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597795210548",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "VSBETIM",
                          rawValue: "1597794208169",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSSYPR",
                          rawValue: "106",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSDIPR",
                          rawValue: "85",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "InputNumber",
                          itemName: "VSPULSE",
                          rawValue: "68",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "Select", rawValue: "0" },
                        {
                          dataType: "InputNumber",
                          itemName: "VSTEMP",
                          rawValue: "37.2",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "耳温",
                          itemName: "VSTEMPPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "坐位",
                          itemName: "VSPOS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "右臂",
                          itemName: "VSARM",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597791610000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597795210999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "2",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后3h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597806010548",
                        },
                        { dataType: "ReferenceTime", itemName: "VSBETIM" },
                        { dataType: "InputNumber", itemName: "VSSYPR" },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSDIPR" },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSPULSE" },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Select", rawValue: "" },
                        { dataType: "InputNumber", itemName: "VSTEMP" },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "",
                        },
                        { dataType: "Select", itemName: "VSTEMPPOS" },
                        { dataType: "Select", itemName: "VSPOS" },
                        { dataType: "Select", itemName: "VSARM" },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597805410000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597806610999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "3",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后5h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597813210548",
                        },
                        { dataType: "ReferenceTime", itemName: "VSBETIM" },
                        { dataType: "InputNumber", itemName: "VSSYPR" },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSDIPR" },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSPULSE" },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Select", rawValue: "" },
                        { dataType: "InputNumber", itemName: "VSTEMP" },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "",
                        },
                        { dataType: "Select", itemName: "VSTEMPPOS" },
                        { dataType: "Select", itemName: "VSPOS" },
                        { dataType: "Select", itemName: "VSARM" },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597812610000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597813810999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "4",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后24h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597881610548",
                        },
                        { dataType: "ReferenceTime", itemName: "VSBETIM" },
                        { dataType: "InputNumber", itemName: "VSSYPR" },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSDIPR" },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSPULSE" },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Select", rawValue: "" },
                        { dataType: "InputNumber", itemName: "VSTEMP" },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "",
                        },
                        { dataType: "Select", itemName: "VSTEMPPOS" },
                        { dataType: "Select", itemName: "VSPOS" },
                        { dataType: "Select", itemName: "VSARM" },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597874410000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597888810999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后48h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1597968010548",
                        },
                        { dataType: "ReferenceTime", itemName: "VSBETIM" },
                        { dataType: "InputNumber", itemName: "VSSYPR" },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSDIPR" },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSPULSE" },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Select", rawValue: "" },
                        { dataType: "InputNumber", itemName: "VSTEMP" },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "",
                        },
                        { dataType: "Select", itemName: "VSTEMPPOS" },
                        { dataType: "Select", itemName: "VSPOS" },
                        { dataType: "Select", itemName: "VSARM" },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597960810000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597975210999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "6",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSOBPO",
                          rawValue: "服药后72h",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "VSPTIM",
                          rawValue: "1598054410548",
                        },
                        { dataType: "ReferenceTime", itemName: "VSBETIM" },
                        { dataType: "InputNumber", itemName: "VSSYPR" },
                        {
                          dataType: "Select",
                          itemName: "VSSRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSSYPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSDIPR" },
                        {
                          dataType: "Select",
                          itemName: "VSDRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSDIPRDE",
                          rawValue: "",
                        },
                        { dataType: "InputNumber", itemName: "VSPULSE" },
                        {
                          dataType: "Select",
                          itemName: "VSPRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Select", rawValue: "" },
                        { dataType: "InputNumber", itemName: "VSTEMP" },
                        {
                          dataType: "Select",
                          itemName: "VSTRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "Select",
                          itemName: "VSTEMPDE",
                          rawValue: "",
                        },
                        { dataType: "Select", itemName: "VSTEMPPOS" },
                        { dataType: "Select", itemName: "VSPOS" },
                        { dataType: "Select", itemName: "VSARM" },
                        { dataType: "Input", itemName: "VSCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1598047210000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1598061610999]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRLL",
                          rawValue: "[90",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSSYPRUL",
                          rawValue: "139]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRLL",
                          rawValue: "[60",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSDIPRUL",
                          rawValue: "89]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHLL",
                          rawValue: "[12",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSBREATHUL",
                          rawValue: "20]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPLL",
                          rawValue: "[35.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSTEMPUL",
                          rawValue: "37.2]",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSELL",
                          rawValue: "[50",
                        },
                        {
                          dataType: "Input",
                          itemName: "VSPULSEUL",
                          rawValue: "100]",
                        },
                      ],
                      seq: 6,
                    },
                  ],
                },
              ],
              name: "生命体征（试验期）",
              oid: "F_VS3",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_PC1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PCPBLCO",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCHETUTY",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCPRRE",
                          rawValue: "1",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_PC2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "1",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597795210548",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597794907035",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597794938154",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597791610000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597795210999]",
                        },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "2",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597797010548",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCTIM",
                          rawValue: "1597797037856",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PCENTIM",
                          rawValue: "1597797053423",
                        },
                        { dataType: "Select", itemName: "PCWTREA" },
                        {
                          dataType: "Select",
                          itemName: "PCPUNYN",
                          rawValue: "Y",
                        },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597796890000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597797130999]",
                        },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "3",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597798810548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597798690000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597798930999]",
                        },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "4",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "4",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597800610548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597800490000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597800730999]",
                        },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "5",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "5",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597802410548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597802290000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597802530999]",
                        },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "6",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "6",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597804210548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597804090000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597804330999]",
                        },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "7",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "7",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597806010548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597805890000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597806130999]",
                        },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "8",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "8",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597807810548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597807690000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597807930999]",
                        },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "9",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "9",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597809610548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597809490000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597809730999]",
                        },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "10",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "10",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597811410548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597811290000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597811530999]",
                        },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "11",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "11",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597813210548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597813090000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597813330999]",
                        },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "12",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "12",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597815010548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597814890000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597815130999]",
                        },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "13",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "13",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597816810548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597816690000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597816930999]",
                        },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "14",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "14",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597818610548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597818490000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597818730999]",
                        },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "15",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "15",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597820410548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597820290000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597820530999]",
                        },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "16",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "16",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597824010548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597823890000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597824130999]",
                        },
                      ],
                      seq: 16,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "17",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "17",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597831210548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597830910000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597831510999]",
                        },
                      ],
                      seq: 17,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "18",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "18",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597838410548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597838110000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597838710999]",
                        },
                      ],
                      seq: 18,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "19",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "19",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597845610548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597845310000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597845910999]",
                        },
                      ],
                      seq: 19,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "20",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "20",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597881610548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597881010000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597882210999]",
                        },
                      ],
                      seq: 20,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "21",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "21",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1597968010548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1597967410000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1597968610999]",
                        },
                      ],
                      seq: 21,
                    },
                    {
                      items: [
                        {
                          dataType: "InputNumber",
                          itemName: "SEQ",
                          rawValue: "22",
                        },
                        {
                          dataType: "Select",
                          itemName: "PCTPT",
                          rawValue: "22",
                        },
                        {
                          dataType: "TimePicker",
                          itemName: "PCPTIM",
                          rawValue: "1598054410548",
                        },
                        { dataType: "ReferenceTime", itemName: "PCTIM" },
                        { dataType: "ReferenceTime", itemName: "PCENTIM" },
                        { dataType: "Select", itemName: "PCWTREA" },
                        { dataType: "Select", itemName: "PCPUNYN" },
                        { dataType: "Input", itemName: "PCCOMT" },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1598053810000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1598055010999]",
                        },
                      ],
                      seq: 22,
                    },
                  ],
                },
              ],
              name: "血样采集记录(PK)",
              oid: "F_PC",
              seq: 0,
            },
          ],
          oid: "V2D4",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_EC",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "ECSTPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "ECTIM",
                          rawValue: "1597198730079",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "正常",
                          itemName: "ECDE",
                          rawValue: "0",
                        },
                        { dataType: "TextArea", itemName: "ECDIAG" },
                        { dataType: "Upload", itemName: "ECIMG" },
                        { dataType: "Input", itemName: "ECCOMT" },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "心电图",
              oid: "F_EC",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_UR1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "URPTIM",
                          rawValue: "1598025600000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "URTIM",
                          rawValue: "1594961598000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1598025600000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1598112000999]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_UR2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "PH",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "5.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[5.0",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "8.0]",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "亚硝酸",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "尿胆原",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "弱阳性(+-)",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "比重",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "1.010",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[1.005",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "1.030]",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "潜血",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "白细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "白细胞镜检",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "/HP",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "5]",
                        },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "管型",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "/LP",
                        },
                        { dataType: "Input", itemName: "URRESULTLL" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "红细胞镜检",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "0",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "/HP",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTUL",
                          rawValue: "3]",
                        },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "维 C",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "胆红素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "葡萄糖",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "蛋白质",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "透明度",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "清",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTLL" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "酮体",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "-",
                        },
                        {
                          dataType: "Input",
                          itemName: "URRESULTLL",
                          rawValue: "阴性",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "URPROJECTTEXT",
                          rawValue: "颜色",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "URRESULT",
                          rawValue: "黄色",
                        },
                        { dataType: "Input", itemName: "UNIT" },
                        { dataType: "Input", itemName: "URRESULTLL" },
                        { dataType: "Input", itemName: "URRESULTUL" },
                        {
                          dataType: "Select",
                          itemName: "UREVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "URABRE" },
                      ],
                      seq: 16,
                    },
                  ],
                },
              ],
              name: "尿常规",
              oid: "F_UR",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_RB1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "RBPTIM",
                          rawValue: "1598025600000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "RBTIM",
                          rawValue: "1594963392000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1598025600000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1598112000999]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_RB2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "中性粒细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "3.23",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[1.8",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "6.3]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "中性粒细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "74",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[40",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "75]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "单核细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.18",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.1",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.6]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "单核细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "4.1",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[3",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "10]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜碱性粒细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.02",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.06]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜碱性粒细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.6",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "1]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜酸细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.5",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.4",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "8]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "嗜酸细胞计数",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.02",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.02",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.52]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "大血小板比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "31.7",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[13.9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "46.7]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均红细胞体积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "100",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "fL" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[82",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "100]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均血小板体积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "10.8",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "fL" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "17]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均血红蛋白浓度",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "320",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[316",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "354]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "平均血红蛋白量",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "32",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "pg" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[27",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "34]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "淋巴细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.91",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[1.1",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "3.2]",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，有临床意义",
                          itemName: "RBEVA",
                          rawValue: "2",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 14,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "淋巴细胞比率",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "20.8",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[20",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "50]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 15,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "白细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "4.36",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[3.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "9.5]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 16,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "红细胞",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "3.79",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^12/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[3.8",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "5.1]",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "RBEVA",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 17,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "红细胞分布宽度CV",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "12.2",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "16.5]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 18,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "红细胞压积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "37.9",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[35",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "45]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 19,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血小板",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "230",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "10^9/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[125",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "350]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 20,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血小板分布宽度",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "16.4",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "fL" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[9",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "18.1]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 21,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血小板压积",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "0.25",
                        },
                        { dataType: "Input", itemName: "UNIT", rawValue: "%" },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[0.17",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "0.4]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 22,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "RBPROJECTTEXT",
                          rawValue: "血红蛋白",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "RBRESULT",
                          rawValue: "121",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTLL",
                          rawValue: "[115",
                        },
                        {
                          dataType: "Input",
                          itemName: "RBRESULTUL",
                          rawValue: "150]",
                        },
                        {
                          dataType: "Select",
                          itemName: "RBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "RBABRE" },
                      ],
                      seq: 23,
                    },
                  ],
                },
              ],
              name: "血常规",
              oid: "F_RB",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_BB1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "TimePicker",
                          itemName: "BBPTIM",
                          rawValue: "1598025600000",
                        },
                        {
                          dataType: "ReferenceTime",
                          itemName: "BBTIM",
                          rawValue: "1594967199000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WISTTI",
                          rawValue: "[1598025600000",
                        },
                        {
                          dataType: "Input",
                          itemName: "WIENTI",
                          rawValue: "1598112000999]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_BB2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "尿素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "2.99",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[2.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "8.2]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "总胆红素",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "9.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "μmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "20.4]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "总蛋白",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "77.2",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[64",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "83]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "氯",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "107.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[95",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "107]",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "BBEVA",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "白蛋白",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "47.4",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "g/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[35",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "55]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "肌酐",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "36",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "μmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[41",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "115]",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "异常，无临床意义",
                          itemName: "BBEVA",
                          rawValue: "1",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "葡萄糖",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "4.74",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[3.9",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "6.1]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "谷丙转氨酶",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "11",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "U/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[0",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "40]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "谷草转氨酶",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "25",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "U/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[8",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "40]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "钠",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "141.2",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[136",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "145]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "BBPROJECTTEXT",
                          rawValue: "钾",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "BBRESULT",
                          rawValue: "4.56",
                        },
                        {
                          dataType: "Input",
                          itemName: "UNIT",
                          rawValue: "mmol/L",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTLL",
                          rawValue: "[3.5",
                        },
                        {
                          dataType: "Input",
                          itemName: "BBRESULTUL",
                          rawValue: "5.3]",
                        },
                        {
                          dataType: "Select",
                          itemName: "BBEVA",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "BBABRE" },
                      ],
                      seq: 11,
                    },
                  ],
                },
              ],
              name: "血生化",
              oid: "F_BB",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_HW",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "HWTIM" },
                        { dataType: "ReferenceResult", itemName: "HEIGHT" },
                        {
                          dataType: "Select",
                          itemName: "HEIRANPAR",
                          rawValue: "",
                        },
                        {
                          dataType: "ReferenceResult",
                          itemName: "WEIGHT",
                          rawValue: "80",
                        },
                        {
                          dataType: "Select",
                          itemName: "WEIRANPAR",
                          rawValue: "0",
                        },
                        { dataType: "ReferenceResult", itemName: "BMI" },
                        {
                          dataType: "Select",
                          itemName: "BMIRANPAR",
                          rawValue: "",
                        },
                        { dataType: "Input", itemName: "HWCOMT" },
                        { dataType: "Input", itemName: "HEIGHTLL" },
                        { dataType: "Input", itemName: "HEIGHTUL" },
                        {
                          dataType: "Input",
                          itemName: "WEIGHTLL",
                          rawValue: "[45",
                        },
                        { dataType: "Input", itemName: "WEIGHTUL" },
                        {
                          dataType: "Input",
                          itemName: "BMILL",
                          rawValue: "[19",
                        },
                        {
                          dataType: "Input",
                          itemName: "BMIUL",
                          rawValue: "28]",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
              ],
              name: "身高体重",
              oid: "F_HW",
              seq: 0,
            },
            {
              groups: [
                {
                  groupOid: "IG_PE1",
                  groupValues: [
                    {
                      items: [
                        { dataType: "TimePicker", itemName: "PEPTIM" },
                        {
                          dataType: "ReferenceTime",
                          itemName: "PETIM",
                          rawValue: "1597198699736",
                        },
                        { dataType: "Input", itemName: "WISTTI" },
                        { dataType: "Input", itemName: "WIENTI" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_PE2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 1,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 2,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "2",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 3,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "3",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 4,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "16",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 5,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "6",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 6,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "7",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 7,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "8",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 8,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "9",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 9,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "13",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 10,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "10",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 11,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "14",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 12,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "11",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "0",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 13,
                    },
                    {
                      items: [
                        {
                          dataType: "Select",
                          itemName: "PETEST",
                          rawValue: "15",
                        },
                        {
                          dataType: "Select",
                          itemName: "PECLSIG",
                          rawValue: "3",
                        },
                        { dataType: "Input", itemName: "PEDESC" },
                      ],
                      seq: 14,
                    },
                  ],
                },
              ],
              name: "体格检查",
              oid: "F_PE",
              seq: 0,
            },
          ],
          oid: "DS",
        },
        {
          forms: [
            {
              groups: [
                {
                  groupOid: "IG_CM1",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Select",
                          dictionaryEntryText: "是",
                          itemName: "CMYN",
                          rawValue: "Y",
                        },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_CM2",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "TRADNAM",
                          rawValue: "扑热息痛",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "不良事件",
                          itemName: "CMCAOFUS",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "口服",
                          itemName: "CMMETH",
                          rawValue: "po",
                        },
                        {
                          dataType: "Input",
                          itemName: "CMCONS",
                          rawValue: "1",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "每日两次",
                          itemName: "CMFREQ",
                          rawValue: "bid",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "CMSTDAT",
                          rawValue: "1597477092414",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "CMENDAT",
                          rawValue: "1597649895431",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                {
                  groupOid: "IG_CM3",
                  groupValues: [
                    {
                      items: [
                        {
                          dataType: "Input",
                          itemName: "THERNAM",
                          rawValue: "针灸",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "既往病史",
                          itemName: "THERCAOFUS",
                          rawValue: "0",
                        },
                        {
                          dataType: "Select",
                          dictionaryEntryText: "隔日一次",
                          itemName: "THERFREQ",
                          rawValue: "qod",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "THERSTDAT",
                          rawValue: "1597390720409",
                        },
                        {
                          dataType: "DatePicker",
                          itemName: "THERENDAT",
                          rawValue: "1597649923155",
                        },
                        { dataType: "Input", itemName: "CMT" },
                      ],
                      seq: 1,
                    },
                  ],
                },
                { groupOid: "IG_CM4", groupValues: [{ items: [], seq: 1 }] },
              ],
              name: "合并用药和治疗",
              oid: "F_CM",
              seq: 0,
            },
          ],
          oid: "CM",
        },
      ],
    },
    trialTypeCode: "8a81807773d90d360173db743de90f0a",
    trialTypeName: "EDC对接测试-空腹",
  })
);
