/*
Super simple handlebars to
generate some test data
*/

let source = document.getElementById("template").innerHTML
let list = document.getElementById("list")

let template = Handlebars.compile(source)

testData.forEach(context => {
  let element = template(context)
  list.insertAdjacentHTML('beforeend', element)
})
