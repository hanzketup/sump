var sump = (function(){

  // Default options
  let options = {
      defaultMatch: /{}.*/,
      targetClass: 'target',
      checkAll: 'all',
      silent: false,
      lazy: false,
      useCheckboxes: false,
      caseSensative: false,
      useButton: '',
      includeChildren: true
    }

  // Default functions
  let onFilterChange = () => {},
      onCheckboxChange = () =>{},
      onTargetUpdate = () =>{},
      target_enable = el => {el.style.display = 'flex'},
      target_disable = el => {el.style.display = 'none'}

  // Declare filter & target stores
  let filterStore = {},
      targetStore = [],
      filterSelectors = []

  // Custom logging to silence warnings in prod
  let log = msg => {
    options.silent
    ? null
    : console.log(msg)
  }


  // Initialize Sump with passed settings
  let init = (settings) => {

    // Replace option defaults with passed settings
    options = Object.assign(options, settings);

    // Loop trough and add all filters
    if(settings['filters']){
      for(let key of Object.keys(settings.filters)){
        addFilter(settings.filters[key])
      }
    }

    // Create an initital target index
    indexTargets()

    // Register eventlistners to button if used
    if(options.useButton){
      registerButton()
    }

    // Register eventlistner to checkboxes if used
    if(options.useCheckboxes){
      attachCheckboxes()
      registerCheckAll()
    }

  }

  // Index target elements by targetclass
  let indexTargets = () => {
    targetStore = [] // Reset targetStore before indexing
    let DOMtargets = [...document.getElementsByClassName(options.targetClass)]
    DOMtargets.forEach(DOMtarget => {
      addTarget(DOMtarget)
    })
  }

  // Append target and find props
  let addTarget = (targetel) => {

    // Add props attached to the target element
    let props = extractProps(targetel.dataset)

    if (options.includeChildren){
      // Add props attached to the targets children
      Object.assign(props, extractFromChild(targetel.children))
    }

    targetStore.push({
      element:targetel,
      props:props,
      inDOM:true,
      matched:true,
      checked:false,
      checkbox:''
    })

  }

  // Extract dataset to props object
  let extractProps = (set) => {
    return Object.keys(set).reduce((props, key) => {
      filterSelectors.includes(key) ? null:log(`Target prop [${key}] not found in filter, proceeding anyway`)
      props[key] = options.caseSensative ? set[key] : set[key].toLowerCase()
      return props
    }, {})
  }


  // Attach eventlistner to all checkboxes
  let attachCheckboxes = () => {
    targetStore.forEach((target) => {
      if(target.inDOM){
        let chk = target.element.querySelector("input[type=checkbox]")
        if(chk){
          target.checkbox = chk // Store checkbox in target obj
          chk.addEventListener('change', () => {
            // On change, toggle prop checked of target
            chk.checked
            ? target.checked = true
            : target.checked = false
            onCheckboxChange() // Callback on checkbox change
          })
        }
        else{
          log(`A checkbox for ${target} could not be found`)
        }
      }
    })
  }

  // Toogle checkbox
  let toggleCheckbox = (target, state) => {
    if(target.inDOM && typeof state === 'boolean'){
      // Toggle checkbox and change target.checked state
      target.checkbox.checked = state
      target.checked = state
    }
  }

  // Check all checkboxes of enabled/matched targets
  let toggleAllEnabled = (state) => {
    targetStore.forEach(target => {
      if(target.matched){
        toggleCheckbox(target, state)
      }
    })
  }

  // Recursively search for props in target children
  extractFromChild = (nodes) => {
    return [...nodes].reduce((props, node) => {

      if(node.dataset){
        Object.assign(props, extractProps(node.dataset))
      }

      if(node.children){
        Object.assign(props, extractFromChild(node.children))
      }

      return props

    }, {})
  }

  // Append filter to filterStore and attach eventlistner
  let addFilter = (filter) => {
    filterStore[filter.selector] = {
      selector: filter.selector,
      id:filter.id,
      match:filter.match,
      value:"",
    }

    let domel = document.getElementById(filter.id)
    if(domel){
      domel.addEventListener('keyup', () => {
        updateFilter(filter, domel.value)
      })
    }
    else{
      log('Could not find filter element')
    }

    // Update filter selector list
    filterSelectors = Object.keys(filterStore).reduce((sel, key) => {
      sel.push(filterStore[key]['selector'])
      return sel
    }, [])

  }

  // Update filter and call updatehandler
  let updateFilter = (filter, value) => {
    filterStore[filter.selector].value = options.caseSensative ? value : value.toLowerCase()
    onFilterChange() // Call onFilterChange callback function
    onChangeUpdateHandler()
  }


  // Call appropriate target update handler
  let onChangeUpdateHandler = () => {
    if(options.lazy && !options.useButton){
      lazyHandler()
    }
    else if(options.useButton){
      updateTargets()
    }
    else{
      updateTargets()
    }
  }

  // Determine if all props matches the filter and enable/disable the target
  let updateTargets = () => {
    targetStore.forEach(target => {

      //fetch all propskeys from the target
      let propkeys = Object.keys(target.props)

      // Represent filter-prop matches as a height
      let propheight = propkeys.reduce((height, key) => {
        if(filterStore[key]){
           return compareProp(
            filterStore[key],
            target.props[key]
          ) ? height + 1 : 0
        }
        else{return height + 1 } // Return props not in filter as matched
      }, 0)

      // If the 'height' matches the number of props, enable
      if (propkeys.length === propheight){
        target.matched = true
        target.inDOM
        ? target_enable(target.element)
        : 0
      }
      else{
        target.matched = false
        target.inDOM
        ? target_disable(target.element)
        : 0
      }

    })
    onTargetUpdate() // Callback on target update
  }

  /*
  compareProp matches the prop and filter
  via the 'match' regex or if not supplied,
  the default match
  */
  let compareProp = (filter, prop) => {
    let match = filter.match || options.defaultMatch,
        calced_match = match

    if(filter.value){
      if(match.search('{}') === 1){ // replace {} with current filter value
        let re_split = match.split('{}')
        calced_match = re_split[0] + filter.value + re_split[1]
      }

      let reg = new RegExp(calced_match)
      return reg.test(prop)

    }
    else{
      return true // Mark as matched on blank filter
    }
  }


  /*
  Load JSON targets for lazyloading
  as a list of objects with props
  */
  let loadExternal = (data) => {
    if(typeof data === 'object'){
      data.forEach(target => {
        // Externals may contain an object meta that stays untouched
        let props = target.props,
            meta = target.meta ? target.meta : {}

        targetStore.push({
          props:props,
          inDOM:false,
          matched:false,
          meta: meta
        })

      })
    }
    else{
      log('External data not in list')
    }
  }


  /*
  Layz creates a delay to prevent unnecessary updates
  saving resources when working with large sets
  of data and hindering ugly flashing
  */
  let layzTimer
  let lazyHandler = () => {
    clearTimeout(layzTimer)
    layzTimer = setTimeout(() => {
      updateTargets()
    }, 600);
  }


  // Register eventlistner to 'checkall' checkbox
  registerCheckAll = () => {
    ca = document.getElementById(options.checkAll)
    if(ca){
      ca.addEventListener('change', () => {
        ca.checked
        ? toggleAllEnabled(true)
        : toggleAllEnabled(false)
        onCheckboxChange() // Callback on checkbox change
      })
    }
  }

  // Register button eventlistner
  let registerButton = (id) => {
    const btn = document.getElementById(id)
    if(btn){
      btn.addEventListener('click', onChangeUpdateHandler())
    }
    else{
      log('Button could not be registred')
    }
  }

  // Return a list of targets present in the DOM
  let getMatchedDOMTargets = (onlychecked) => {
    return targetStore.reduce((res, target) => {
      target.matched
      ? res.push(target)
      : 0
      return res
    }, [])
  }

  // Return a list of matched external targets
  let getMatchedExtTargets = () => {
    return targetStore.reduce((res, target) => {
      target.matched && !target.inDOM
      ? res.push(target)
      : 0
      return res
    }, [])
  }

  // Public api
  return {
    init: init,
    addFilter: addFilter,
    getAllFilters: filterStore,
    indexTargets: indexTargets,
    getAllTargets: targetStore,
    getMatchedTargets: getMatchedDOMTargets,
    getMatchedExtTargets: getMatchedExtTargets,
    loadExternal: loadExternal,
    onFilterChange = f => onFilterChange = f,
    onCheckboxChange = f => onCheckboxChange = f,
    onTargetUpdate = f => onTargetUpdate = f,
    targetEnable = f => target_enable = f,
    targetDisable = f => target_disable = f,
  }

 })();
