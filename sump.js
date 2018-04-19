
var sump = (function(){

  let default_match = /.*/,
      default_enable = (el) => {}
      default_disable = (el) => {}

  let target_enable,
      target_disable

  let onFilterChangeCallback = () => {},
      FilterList = {},
      targets = {}


  let init = (options) => {

  }

  let index = (options) => {

  }

  let addFilter = (filters) => {
    filters.forEach((single) => {
      FilterList[single.name] = {
        ...single,
        value:"",
        selector: single.selector || single.name
      }

      domel = document.getElementById(single.id)
      domel.addEventListener('keyup', () => {
          updateFilter(single, domel.value)
      })

    })
  }

  let updateFilter = (filter, value) => {
    onFilterChangeCallback()
    FilterList[filter.name].value = value
  }

  let getFilter = (filter) => {
    return FilterList[filter] || ""
  }

  let onFilterChange = (cb) => {
    onFilterChangeCallback = cb
  }


  let onTargetEnabled = () => {}
  let onTargetDisabled = () => {}


  return {
    init: init,
    addFilter: addFilter,
    getFilter: getFilter,
    getFilterList: FilterList,
    onFilterChange: onFilterChange,
    indexTargets: index,
    onTargetEnabled: onTargetEnabled,
    onTargetDisabled: onTargetDisabled
  }
 })();
