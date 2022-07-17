const cheerio = require("cheerio")
const axios = require("axios")
const https = require("https")
const http = require("http")


async function main(){
    try{
        const cheerioRequest = axios.create({
            baseURL: "https://www.nationalparks.nsw.gov.au",
            timeout: 1000,
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
            headers:{
                "authority": "www.nationalparks.nsw.gov.au",
                // "cookie":"__qca=P0-186667997-1640860695154; _hjSessionUser_2686333=eyJpZCI6IjE2ZmE2OGYyLWE0OWUtNWRhNC04NjMzLTZiOWU4Mzc4NzIwNSIsImNyZWF0ZWQiOjE2NDM4NTc1MTE3MTgsImV4aXN0aW5nIjpmYWxzZX0=; _ga_NJV7DY7LLC=GS1.1.1644366136.3.1.1644366617.0; _ga_BM6V05EPQ5=GS1.1.1645484754.1.1.1645484806.8; fs_uid=rs.fullstory.com#14KCXC#6061948647956480:5621045315690496/1680132661; _actts=1643857429.1648417498.1648596666; _actvc=8; _actcc=1.1.20.20; _actmu=e05b9137-c3d2-47d2-8756-4b5194dfd303; _ga_HYXFFWPGSL=GS1.1.1649638182.1.1.1649638195.0; _ga_NQRPJKT4W1=GS1.1.1649638182.1.1.1649638195.0; nmstat=6f2c66bb-ff74-1723-7410-432313a4fd51; intercom-id-fcojgwrh=35e5a536-d35d-43a1-abb3-3394d007f8ad; SC_ANALYTICS_GLOBAL_COOKIE=5c32020ba65944c29835a7c4dbdc06d0|True; _hjSessionUser_764358=eyJpZCI6ImJhZmY5ZmZkLTQ5NzgtNWI4NS05ZTA1LTUxZjViODhhMzlkZSIsImNyZWF0ZWQiOjE2NTI3ODM3MTI1MzUsImV4aXN0aW5nIjp0cnVlfQ==; AMCV_A45E356C5CF4DB510A495C43@AdobeOrg=359503849|MCIDTS|19131|MCMID|79186145917490628043001066039778020613|MCAAMLH-1653439151|8|MCAAMB-1653439151|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1652841551s|NONE|vVersion|5.0.1; _ga_Q8QJ1XQJ93=GS1.1.1652834352.1.1.1652836078.0; _ga_M42WLLZ7DL=GS1.1.1652834352.1.1.1652836078.0; _ga=GA1.3.537879841.1640860694; _ga_6EFPPPC282=GS1.1.1653020818.1.1.1653020858.0; NSC_JOaxgmbpekm4x10b44ezxbdxn2hbidq=ffffffff09005a3e45525d5f4f58455e445a4a423660; ASP.NET_SessionId=qjfffshudv5m2kquaku5iyho; __RequestVerificationToken=53f6TQPSaghp3HJ_APWYPghFeOf5Be_43Q0zSKIwAFPgwoZpmfGfxx7QRA7luOhZYIpv9b0BS9rS25HqdIRxj6Cf57kTDjYXNlUdlUl9PM81; resolution=1680,2; pixelDensity=2; timezoneoffset=-600",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
            }
        })

        const requestTokens = await cheerioRequest.get(`/camping-and-accommodation/campgrounds/silent-creek-campground`).then((axiosRequest) => {
            const data = cheerio.load(axiosRequest.data)
                return {
                    "contextID": data(".mb-3").get(1).attribs["data-context-item-id"],
                    "verifToken": data('input[name="__RequestVerificationToken"]').get(1).attribs["value"]
                }
        })
        // const myUrl = `/npws/ReservationApi/DetailedAvailability?contextItemId=${requestTokens.contextID}&dateFrom=30 Jul 2022&dateTo=31 Jul 2022&adults=2&children=0&infants=0&formToken=${requestTokens.verifToken}`
        await cheerioRequest.get(`/npws/ReservationApi/DetailedAvailability?contextItemId=${requestTokens.contextID}&dateFrom=30 Jul 2022&dateTo=31 Jul 2022&adults=2&children=0&infants=0&formToken=${requestTokens.verifToken}`)
        // console.log(response2)
    }
    catch(error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
        //   console.log(error.response.data)
          console.log(error.response.status)
        //   console.log(error.response.headers)
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message)
        }
      }
}

main()

// async function getHtmlBody(url){
//     if(url){
//         return await axios.get(url, { withCredentials: true }).then(request => cheerio.load(request.data))
//     }
//     else{
//         throw `URL is missing(${url})`
//     }
// };


// async function main(){
//     try{
//         const requestTokens = await getHtmlBody("https://www.nationalparks.nsw.gov.au/camping-and-accommodation/campgrounds/silent-creek-campground").then((body) =>{
//             return {
//                 "contextID": body(".mb-3").get(1).attribs["data-context-item-id"],
//                 "verifToken": body('input[name="__RequestVerificationToken"]').get(1).attribs["value"]
//             }
//         })
//         const myUrl = `https://www.nationalparks.nsw.gov.au/npws/ReservationApi/DetailedAvailability?contextItemId=${requestTokens.contextID}&dateFrom=30 Jul 2022&dateTo=31 Jul 2022&adults=2&children=0&infants=0&formToken=${requestTokens.verifToken}`
//         console.log(myUrl)
//         const response = await axios.get(myUrl)
//         // const data = await response.json();

//         console.log(response)
//     }
//     catch(err) {
//         console.error(`ERROR: ${err}`)
//     }
// }

// main()

// async function getAvailabilityList(){
//     const response = await fetch("www.nationalparks.nsw.gov.au/camping-and-accommodation/campgrounds/silent-creek-campground")
//                                   https://www.nationalparks.nsw.gov.au/npws/ReservationApi/DetailedAvailability?contextItemId={74646154-157B-431E-8743-E32184E4294E}&dateFrom=30 Jul 2022&dateTo=31 Jul 2022&adults=2&children=0&infants=0&formToken=TLFmvhPcIjnfxr4CbVFB8s_BjVVRcWl8R1J-ix5ubuo-K50EFPrMwNUQcNJKczWEjLtnVDQr4aRcND18qYmmm_iEPgWzytVO1L8wBTRcxpc1
//                                   https://www.nationalparks.nsw.gov.au/npws/ReservationApi/DetailedAvailability?contextItemId={74646154-157B-431E-8743-E32184E4294E}&dateFrom=30 Jul 2022&dateTo=31 Jul 2022&adults=2&children=0&infants=0&formToken=g-DSF5BJvmBLEfC_I1m__Wu-q_7Ls_bRlD4bUo2x9kEd_Fm_SHj6zEUgccJsMcVOjgFE6nI31rntslhS5RB2yEZ23K9YlUO84kwlTRNUHy01
//     // const data = await response.json();

//     console.log(response)
// }

// getAvailabilityList()