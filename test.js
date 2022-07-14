const axios = require("axios")
const url = 'https://58f58f38c9deb71200ceece2.mockapi.io/Mapss'
    
function createRequest1() {
  const request = axios.get(url)

  request
  .then(result => console.log('(1) Inside result:'))
  .catch(error => console.error('(1) Inside error:'))

  return request
}

function createRequest2() {
  const request = axios.get(url)

  return request
  .then(result => console.log('(2) Inside result:'))
  .catch(error => console.error('(2) Inside error:'))
}

createRequest1()
.then(result => console.log('(1) Outside result:'))
.catch(error => console.error('(1) Outside error:'))

createRequest2()
.then(result => console.log('(2) Outside result:'))
.catch(error => console.error('(2) Outside error:'))