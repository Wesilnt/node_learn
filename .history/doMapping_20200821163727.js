const _ = require("loadsh");
const moment = require("moment");

module.exports = function doMapping(input, ...mappings) {
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
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _it = gs[0].items.filter((i) => i.itemName === "WRYN");
              if (_it.length > 0) {
                let _val =
                  _it[0]["rawValue"] == "Y"
                    ? "是"
                    : _it[0]["rawValue"] == "N"
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
              _it = gs[0].items.filter((i) => i.itemName === "WRCMT");
              if (_it.length > 0) {
                _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                _eachDestTree(
                  studyEventData,
                  "V2",
                  "RS",
                  "RS",
                  "RSDESC",
                  0,
                  2,
                  _val
                );
              }
            }
          }
        }
      }

      srcEvent = source.subjects.visits.filter((v) => v.oid === "V2D1")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_WR");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_WR") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _it = gs[0].items.filter((i) => i.itemName === "WRYN");
              if (_it.length > 0) {
                let _val =
                  _it[0]["rawValue"] == "Y"
                    ? "是"
                    : _it[0]["rawValue"] == "N"
                    ? "否"
                    : "";
                _eachDestTree(
                  studyEventData,
                  "V5",
                  "RS",
                  "RS",
                  "RSYN",
                  0,
                  2,
                  _val
                );
              }
              _it = gs[0].items.filter((i) => i.itemName === "WRCMT");
              if (_it.length > 0) {
                _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                _eachDestTree(
                  studyEventData,
                  "V5",
                  "RS",
                  "RS",
                  "RSDESC",
                  0,
                  2,
                  _val
                );
              }
            }
          }
        }
      }

      srcEvent = source.subjects.visits.filter((v) => v.oid === "V1D1")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_UBS");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_UBS") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _it = gs[0].items.filter((i) => i.itemName === "UBSYN");
              if (_it.length > 0) {
                let _val =
                  _it[0]["rawValue"] == "Y"
                    ? "是"
                    : _it[0]["rawValue"] == "N"
                    ? "否"
                    : "";
                _eachDestTree(
                  studyEventData,
                  "V2",
                  "RS",
                  "RS",
                  "RSYN",
                  0,
                  3,
                  _val
                );
              }
              _it = gs[0].items.filter((i) => i.itemName === "UBSCMT");
              if (_it.length > 0) {
                _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                _eachDestTree(
                  studyEventData,
                  "V2",
                  "RS",
                  "RS",
                  "RSDESC",
                  0,
                  3,
                  _val
                );
              }
            }
          }
        }
      }

      srcEvent = source.subjects.visits.filter((v) => v.oid === "V2D1")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_UBS");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_UBS") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _it = gs[0].items.filter((i) => i.itemName === "UBSYN");
              if (_it.length > 0) {
                let _val =
                  _it[0]["rawValue"] == "Y"
                    ? "是"
                    : _it[0]["rawValue"] == "N"
                    ? "否"
                    : "";
                _eachDestTree(
                  studyEventData,
                  "V5",
                  "RS",
                  "RS",
                  "RSYN",
                  0,
                  3,
                  _val
                );
              }
              _it = gs[0].items.filter((i) => i.itemName === "UBSCMT");
              if (_it.length > 0) {
                _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                _eachDestTree(
                  studyEventData,
                  "V5",
                  "RS",
                  "RS",
                  "RSDESC",
                  0,
                  3,
                  _val
                );
              }
            }
          }
        }
      }

      // 生命体征
      srcEvent = source.subjects.visits.filter((v) => v.oid === "SCRN")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_VS1");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_VS1") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _fgs = gs[0] || null;
              if (_fgs) {
                let _it = _fgs.items.filter((i) => i.itemName === "VSTIM");
                let _v1 = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                if (_v1) {
                  _v1 = moment(parseInt(_v1)).format("YYYY-MM-DD HH:mm:ss");
                  _eachDestTree(
                    studyEventData,
                    "SCR",
                    "VS1",
                    "VS1",
                    "VSDTC",
                    0,
                    0,
                    _v1
                  );
                }
              }
              let _gs = _.orderBy(gs, ["seq"], ["desc"]);
              let _c = 0;
              let _c1 = 0;
              for (var _is = 0; _is < _gs.length; _is++) {
                let _tws = gs[_is].items.filter((i) => i.itemName === "VSPOS");
                let _tw1 =
                  _tws.length > 0 && _tws[0]["rawValue"]
                    ? _tws[0]["rawValue"]
                    : "";
                _tw2 =
                  _tw1 == "0"
                    ? "ZW"
                    : _tw1 == "1"
                    ? "YWW"
                    : _tw1 == "2"
                    ? "ZHW"
                    : _tw1 == "3"
                    ? "FWW"
                    : _tw1 == "4"
                    ? "NA"
                    : "";
                if (!_tw2 || _tw2 == "ZW") {
                  continue;
                }
                if (_tw2 && (_tw2 == "YWW" || _tw2 == "FWW")) {
                  let _its = gs[_is].items.filter(
                    (i) => i.itemName === "VSSYPR"
                  );
                  let _vsp =
                    _its.length > 0 && _its[0]["rawValue"]
                      ? _its[0]["rawValue"]
                      : "";
                  if (_vsp) {
                    _eachDestTree(
                      studyEventData,
                      "SCR",
                      "VS1",
                      "VS12",
                      "VSORRES1",
                      0,
                      0,
                      _vsp
                    );
                    _c1++;
                  }

                  _its = gs[_is].items.filter((i) => i.itemName === "VSDIPR");
                  _vsp =
                    _its.length > 0 && _its[0]["rawValue"]
                      ? _its[0]["rawValue"]
                      : "";
                  if (_vsp) {
                    _eachDestTree(
                      studyEventData,
                      "SCR",
                      "VS1",
                      "VS12",
                      "VSORRES2",
                      0,
                      0,
                      _vsp
                    );
                    _c1++;
                  }
                }

                if (_tw2 && _tw2 == "ZHW") {
                  let _its = gs[_is].items.filter(
                    (i) => i.itemName === "VSSYPR"
                  );
                  let _vsp =
                    _its.length > 0 && _its[0]["rawValue"]
                      ? _its[0]["rawValue"]
                      : "";
                  if (_vsp) {
                    _eachDestTree(
                      studyEventData,
                      "SCR",
                      "VS1",
                      "VS12",
                      "VSORRES3",
                      0,
                      0,
                      _vsp
                    );
                    _c1++;
                  }

                  _its = gs[_is].items.filter((i) => i.itemName === "VSDIPR");
                  _vsp =
                    _its.length > 0 && _its[0]["rawValue"]
                      ? _its[0]["rawValue"]
                      : "";
                  if (_vsp) {
                    _eachDestTree(
                      studyEventData,
                      "SCR",
                      "VS1",
                      "VS12",
                      "VSORRES4",
                      0,
                      0,
                      _vsp
                    );
                    _c1++;
                  }
                }
                if (_c1 == 4) {
                  break;
                }
              }
              for (var _s = 0; _s < _gs.length; _s++) {
                let _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "SCR",
                      "VS1",
                      "VS11",
                      "VSORRES",
                      0,
                      1,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSREDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "SCR",
                        "VS1",
                        "VS11",
                        "VSCLSIG",
                        0,
                        1,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "SCR",
                      "VS1",
                      "VS11",
                      "VSORRES",
                      0,
                      2,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter(
                      (i) => i.itemName === "VSPULSEDE"
                    );
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "SCR",
                        "VS1",
                        "VS11",
                        "VSCLSIG",
                        0,
                        2,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[_s].items.filter((i) => i.itemName === "VSPOS");
                _tw =
                  _it.length > 0 && _it[0]["rawValue"]
                    ? _it[0]["rawValue"]
                    : "";
                _ntw =
                  _tw == "0"
                    ? "ZW"
                    : _tw == "1"
                    ? "YWW"
                    : _tw == "2"
                    ? "ZHW"
                    : _tw == "3"
                    ? "FWW"
                    : _tw == "4"
                    ? "NA"
                    : "";
                if (_ntw && _ntw == "ZW") {
                  _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                  if (_it.length > 0) {
                    let _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "SCR",
                        "VS1",
                        "VS11",
                        "VSORRES",
                        0,
                        3,
                        _val
                      );
                      _c++;
                      _it = gs[0].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "SCR",
                          "VS1",
                          "VS11",
                          "VSCLSIG",
                          0,
                          3,
                          _val1
                        );
                      }
                    }
                  }

                  _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                  if (_it.length > 0) {
                    let _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "SCR",
                        "VS1",
                        "VS11",
                        "VSORRES",
                        0,
                        4,
                        _val
                      );
                      _c++;
                      _it = gs[0].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "SCR",
                          "VS1",
                          "VS11",
                          "VSCLSIG",
                          0,
                          4,
                          _val1
                        );
                      }
                    }
                  }
                }
                if (_c == 4) {
                  break;
                }
              }
            }
          }
        }
      }

      // 生命体征 V1 -1
      srcEvent = source.subjects.visits.filter((v) => v.oid === "V1D0")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_VS1");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_VS1") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _gs = _.orderBy(gs, ["seq"], ["desc"]);
              let _c = 0;
              for (var _s = 0; _s < _gs.length; _s++) {
                let _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V1",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      1,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSREDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V1",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        1,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V1",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      2,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter(
                      (i) => i.itemName === "VSPULSEDE"
                    );
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V1",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        2,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[0].items.filter((i) => i.itemName === "VSSYPR");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V1",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      3,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPRDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V1",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        3,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[0].items.filter((i) => i.itemName === "VSDIPR");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V1",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      4,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPRDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V1",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        4,
                        _val1
                      );
                    }
                  }
                }
                if (_c == 4) {
                  break;
                }
              }
            }
          }
        }
      }

      // 生命体征 V4 -1
      srcEvent = source.subjects.visits.filter((v) => v.oid === "V2D0")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_VS1");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_VS1") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _gs = _.orderBy(gs, ["seq"], ["desc"]);
              let _c = 0;
              for (var _s = 0; _s < _gs.length; _s++) {
                let _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V4",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      1,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSREDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V4",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        1,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V4",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      2,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter(
                      (i) => i.itemName === "VSPULSEDE"
                    );
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V4",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        2,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[0].items.filter((i) => i.itemName === "VSSYPR");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V4",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      3,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPRDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V4",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        3,
                        _val1
                      );
                    }
                  }
                }

                _it = gs[0].items.filter((i) => i.itemName === "VSDIPR");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val) {
                    _eachDestTree(
                      studyEventData,
                      "V4",
                      "VS3",
                      "VS11",
                      "VSORRES",
                      0,
                      4,
                      _val
                    );
                    _c++;
                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPRDE");
                    _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                    _val1 =
                      _val == "0"
                        ? "正常"
                        : _val == "1"
                        ? "异常，无临床意义"
                        : _val == "2"
                        ? "异常，有临床意义"
                        : _val == "3"
                        ? ""
                        : "";
                    if (_val1) {
                      _eachDestTree(
                        studyEventData,
                        "V4",
                        "VS3",
                        "VS11",
                        "VSCLSIG",
                        0,
                        4,
                        _val1
                      );
                    }
                  }
                }
                if (_c == 4) {
                  break;
                }
              }
            }
          }
        }
      }

      // 生命体征 V3 试验期1 1-4
      srcEvent = source.subjects.visits.filter((v) => v.oid === "V1D4")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_VS3");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_VS3") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _gs = _.orderBy(gs, ["seq"], ["asc"]);
              for (var _s = 0; _s < _gs.length; _s++) {
                let _it = gs[_s].items.filter((i) => i.itemName === "VSOBPO");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val && _val == "服药前1h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        1,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          1,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          1,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        2,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          2,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          2,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        3,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          3,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          3,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        4,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          4,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          4,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后3h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        5,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          5,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          5,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        6,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          6,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          6,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        7,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          7,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          7,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        8,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          8,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          8,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后5h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        9,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          9,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          9,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        10,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          10,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          10,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        11,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          11,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          11,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        12,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          12,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          12,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后24h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        13,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          13,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          13,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        14,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          14,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          14,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        15,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          15,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          15,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        16,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          16,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          16,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后48h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        17,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          17,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          17,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        18,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          18,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          18,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        19,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          19,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          19,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        20,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          20,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          20,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后72h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        21,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          21,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          21,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        22,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          22,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          22,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        23,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          23,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          23,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V3",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        24,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          24,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V3",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          24,
                          _val2
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 生命体征 V6 试验期2 1-4
      srcEvent = source.subjects.visits.filter((v) => v.oid === "V2D4")[0];
      srcForms = srcEvent.forms.filter((f) => f.oid === "F_VS3");
      if (srcForms && srcForms.length > 0) {
        for (var _j = 0; _j < srcForms.length; _j++) {
          if (srcForms[_j].oid === "F_VS3") {
            let gs =
              srcForms[_j].groups &&
              srcForms[_j].groups.length > 0 &&
              srcForms[_j].groups[0].groupValues &&
              srcForms[_j].groups[0].groupValues.length > 0
                ? srcForms[_j].groups[0].groupValues
                : [];
            if (gs.length > 0) {
              let _gs = _.orderBy(gs, ["seq"], ["asc"]);
              for (var _s = 0; _s < _gs.length; _s++) {
                let _it = gs[_s].items.filter((i) => i.itemName === "VSOBPO");
                if (_it.length > 0) {
                  let _val = _it[0]["rawValue"] ? _it[0]["rawValue"] : "";
                  if (_val && _val == "服药前1h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        1,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          1,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          1,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        2,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          2,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          2,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        3,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          3,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          3,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        4,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          4,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          4,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后3h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        5,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          5,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          5,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        6,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          6,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          6,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        7,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          7,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          7,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        8,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          8,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          8,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后5h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        9,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          9,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          9,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        10,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          10,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          10,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        11,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          11,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          11,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        12,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          12,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          12,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后24h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        13,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          13,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          13,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        14,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          14,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          14,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        15,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          15,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          15,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        16,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          16,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          16,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后48h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        17,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          17,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          17,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        18,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          18,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          18,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        19,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          19,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          19,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        20,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          20,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          20,
                          _val2
                        );
                      }
                    }
                  }

                  if (_val && _val == "服药后72h") {
                    _it = gs[_s].items.filter((i) => i.itemName === "VSTEMP");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        21,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSTEMPDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          21,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          21,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSPULSE");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        22,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSPULSEDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          22,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          22,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSSYPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        23,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSSYPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          23,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          23,
                          _val2
                        );
                      }
                    }

                    _it = gs[_s].items.filter((i) => i.itemName === "VSDIPR");
                    _val =
                      _it.length > 0 && _it[0]["rawValue"]
                        ? _it[0]["rawValue"]
                        : "";
                    if (_val) {
                      _eachDestTree(
                        studyEventData,
                        "V6",
                        "VS2",
                        "VS2",
                        "VSORRES",
                        0,
                        24,
                        _val
                      );

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSDIPRDE"
                      );
                      _val =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val1 =
                        _val == "0"
                          ? "正常"
                          : _val == "1"
                          ? "异常，无临床意义"
                          : _val == "2"
                          ? "异常，有临床意义"
                          : _val == "3"
                          ? ""
                          : "";
                      if (_val1) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSCLSIG",
                          0,
                          24,
                          _val1
                        );
                      }

                      _it = gs[_s].items.filter(
                        (i) => i.itemName === "VSBETIM"
                      );
                      _val2 =
                        _it.length > 0 && _it[0]["rawValue"]
                          ? _it[0]["rawValue"]
                          : "";
                      _val2 = moment(parseInt(_val2)).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      if (_val2) {
                        _eachDestTree(
                          studyEventData,
                          "V6",
                          "VS2",
                          "VS2",
                          "VSDTC",
                          0,
                          24,
                          _val2
                        );
                      }
                    }
                  }
                }
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
      if (
        r.item.dataType === "datetime" ||
        r.item.dataType === "date" ||
        r.item.dataType === "DatePicker" ||
        r.item.dataType === "ReferenceTime" ||
        r.item.dataType === "TimePicker"
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

    function _eachDestTree(
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
      if (desEvents.length == 0) {
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
        (g) => g.ItemGroupOID === groupOID && g.ItemGroupRepeatKey === groupR
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
    }

    function _trimBrackets(val) {
      let _val = val || "";
      let _inx = _val.indexOf("[");
      let _nVal = { Type: "" };
      if (_inx == 0) {
        _nVal.Type = "≥";
        _nVal.Value = _val.substr(1, _val.length - 1);
      } else if (_inx == _val.length - 1) {
        _nVal.Type = "≤";
        _nVal.Value = _val.substring(0, _val.length - 1);
      } else _nVal.Value = _val;
      return _nVal;
    }
  }

  let studyEventData = [];
  let count = 0;
  mappings.forEach((m) => {
    try {
      doOneMapping(global.etrialInput, studyEventData, m, count);
      count++;
    } catch (ex) {
      console.log(ex.message, ex.stack);
    }
  });
  console.log(JSON.stringify(studyEventData));
  global.edcSubject["StudyEventData"] = studyEventData;
  return studyEventData;
};
