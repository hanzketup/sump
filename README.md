# Sump - Foolproof filtering
The goal of this project is to make filtering of large datasets a bit more approachable.

### [Check out the Demo!](https://hanzketup.github.io/sump/)

## Examples

  Alright lets say we have a list of students with a first and last name, together with the number of [Books](https://www.youtube.com/watch?v=7C5zM8CnZF0) they own.
  we start by building a header/legend, where the filters live:

```html
  <div>
    <input id="firstname" type="text" placeholder="All">
    <input id="lastname"  type="text" placeholder="All">
    <input id="books"  type="text" placeholder="All">
  </div>
```
Then we create our first target like this:
```html
  <div class="student_target">
    <p data-firstname="John">John</p>
    <p data-lastname="Dough">Dough</p>
    <p data-books="12">12</p>
  </div>
```
or like this, if you want a tiny performance boost:
```html
  <div class="student_target" data-firstname="John" data-lastname="Dough" data-books="12">
    <p>John</p>
    <p>Dough</p>
    <p>12</p>
  </div>
```
Finally we initialize sump like this:
```javascript
sump.init({
  targetClass:'student_target', //The class of the targets
  includeChildren:true, //Disable if you define props in the root element
  lazy:false, // Lazy waits for the user to stop writing before reloading
  silent:false, //Disable console output for warnings
  filters: [ //Pass a list of filter
    {
      selector: 'firstname', //The name of the prop, minus 'data-'
      id: 'firstname', //The id of the filters input element
      match: '^{}+' //A regex, where {} is replaced with the current value (optional)
    },
    {
      selector: 'lastname',
      id: 'lastname',
      match: '^{}+'
    },
    {
      selector: 'books',
      id: 'books',
      match: '^{}+'
    }
  ]
})
```
### Rendering
Actually rendering of the targets is all up to you. If you are loading in target elements dynamically, simply call indexTargets to reindex.
```javascript
  sump.indexTargets()
```

## Options

### targetClass
- Type: `String`
- Default: `'target'`

Set the class to be index as targets.

### checkAll
- Type: `String`
- Default: `'all'`

Set the id of a checkAll checkbox.

### silent
- Type: `Boolean`
- Default: `false`

Silence all warings in the console.

### lazy
- Type: `Boolean`
- Default: `false`

Wait for user to stop typing before updating target list.

### useCheckboxes
- Type: `Boolean`
- Default: `false`

Enable checkbox functionality.

### caseSensative
- Type: `Boolean`
- Default: `false`

Make filters and props case sensitive. Defaults all to lowercase, disregarding input casing.

### useButton
- Type: `String`
- Default: `''`

Use a button to update targets instead of default/lazy loading.

### includeChildren
- Type: `Boolean`
- Default: `true`

Include children when looking for props in dataset.


## Functions

### indexTargets()
- Type: `Function`

(re) index all targets in the DOM.

### addFilter(obj)
- Type: `Function`

Add a filter separately from init.

### targetEnable()
- Type: `Function`
- default: `(element) => element.style.display = 'flex'`

Rewrite the function called when an item is enabled.

### targetDisable()
- Type: `Function`
- default: `(element) => element.style.display = 'none'`

Rewrite the function called when an item is disabled.

### loadExternal(json)
- Type: `Function`
- Format: ` [ {props:{}, meta:{}}, ]`

add non-dom targets to targetstore, for lazyloading.


## Callbacks

### onFilterChange()
- Type: `Function`

Pass a function to be called when something is typed in a filter input.

### onCheckboxChange()
- Type: `Function`

Pass a function to be called when a checkbox changes state.

### onTargetUpdate()
- Type: `Function`

Pass a function to be called when targets are updated.


## Getters

### getAllFilters
- Type: `Property`

Get an object with all filters.

### getAllTargets
- Type: `Property`

Get a list of all targets.

### getMatchedTargets
- Type: `function`

Get only DOM targets that matches the filters.

### getMatchedExtTargets
- Type: `function`

Get matched non-DOM targets.
