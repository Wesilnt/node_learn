const data = require("./data");
const _ = require("loadsh");

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
  function doOneMapping(source, studyEventData, mapping, count) {
    // 强制转换 2020-08-20 对接eTrail
    if (count == 0) {
      let srcEvent = source.subjects.visits.filter((v) => v.oid === "V1D1")[0];
      let srcForms = srcEvent.forms.filter((f) => f.oid === "F_WR");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_WR") {
            let gs = srcForms[_j].groups.filter((g) => g.groupOid === "IG_WR");
            if (gs.length > 0) {
              let _it = gs.items.filter((i) => i.itemName === "WRYN");
              if (_it.length > 0) {
                let _val =
                  _it["rawValue"] == "Y"
                    ? "是"
                    : _it["rawValue"] == "N"
                    ? "否"
                    : "";
                _eachDestTree(
                  studyEventData,
                  "V2",
                  "RS",
                  "RS",
                  "RSYN",
                  0,
                  2,
                  _val
                );
              }
            }
          }
        }
      }
    }

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
      if (r.item.dataType === "datetime" || r.item.dataType === "date") {
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

    var _eachDestTree = function (
      studyEvents,
      eventOID,
      formOID,
      groupOID,
      itemOID,
      fromR,
      groupR,
      value
    ) {
      // 获取目标的结构及值
      let desEvents = studyEvents.filter((v) => v.StudyEventOID === eventOID);
      let destVist = null;
      if (desEvent.length == 0) {
        destVist = {
          StudyEventOID: eventOID,
          StudyEventRepeatKey: 0,
          FormData: [],
        };
        studyEventData.push(destVist);
      } else {
        destVist = desEvents[0];
      }
      let desForms = destVist.FormData || [];
      let desForms1 = desForms.filter(
        (f) => f.FormOID === formOID && f.FormRepeatKey === fromR
      );
      let desForm = null;
      if (desForms1.length == 0) {
        desForm = {
          FormOID: formOID,
          FormRepeatKey: fromR,
          ItemGroupData: [],
        };
        destVist.FormData.push(desForm);
      } else {
        desForm = desForms1[0];
      }
      let desGroups = desForm.ItemGroupData || [];
      let desGroups1 = desGroups.filter(
        (g) => g.ItemGroupOID === groupOID && f.ItemGroupRepeatKey === groupR
      );
      let desGroup = null;
      if (desGroups1.length > 0) {
        desGroup = desGroups1[0];
      } else {
        desGroup = {
          ItemGroupOID: groupOID, // 字段组的OID
          ItemGroupRepeatKey: groupR, // 字段组值的RepeatNo
          ItemData: [],
        };
        desForm.ItemGroupData.push(desGroup);
      }

      let desItems = desGroup.ItemData || [];
      let desItems1 = desItems.filter((i) => i.ItemOID === itemOID);
      let itemData = null;
      if (desItems1.length > 0) {
        desItems1[0].Value = value;
        itemData = desItems1[0];
      } else {
        itemData = {
          ItemOID: itemOID,
          Value: value,
        };
        desGroup.ItemData.push(itemData);
      }
    };
  }

  let studyEventData = [];
  let count = 0;
  mappings.forEach((m) => {
    try {
      console.log(doOneMapping(global.etrialInput, studyEventData, m, count));
      count++;
    } catch (ex) {
      console.log(ex.message, ex.stack);
    }
  });
  if (!global.edcSubject) {
    global.edcSubject = {};
  }
  console.log(JSON.stringify(studyEventData));
  global.edcSubject["StudyEventData"] = studyEventData;
  return global.edcOutput;
}

console.log(doMapping(data.input, data.mapping));
