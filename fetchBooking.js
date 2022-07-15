const cheerio = require("cheerio")
const axios = require("axios")


async function getHtmlBody(url){
    if(url){
        return await axios.get(url, { withCredentials: true }).then(request => cheerio.load(request.data))
    }
    else{
        throw `URL is missing(${url})`
    }
};


async function main(){
    const requestTokens = await getHtmlBody("https://www.nationalparks.nsw.gov.au/camping-and-accommodation/campgrounds/silent-creek-campground").then((body) =>{
        return {
            "contextID": body(".mb-3").get(1).attribs["data-context-item-id"],
            "verifToken": body('input[name="__RequestVerificationToken"]').get(1).attribs["value"]
        }
    })
    console.log(requestTokens)
}

main()

// async function getAvailabilityList(){
//     const response = await fetch("www.nationalparks.nsw.gov.au/camping-and-accommodation/campgrounds/silent-creek-campground")
//                                   https://www.nationalparks.nsw.gov.au/npws/ReservationApi/DetailedAvailability?contextItemId={74646154-157B-431E-8743-E32184E4294E}&dateFrom=30 Jul 2022&dateTo=31 Jul 2022&adults=2&children=0&infants=0&formToken=TLFmvhPcIjnfxr4CbVFB8s_BjVVRcWl8R1J-ix5ubuo-K50EFPrMwNUQcNJKczWEjLtnVDQr4aRcND18qYmmm_iEPgWzytVO1L8wBTRcxpc1
//     // const data = await response.json();

//     console.log(response)
// }

// getAvailabilityList()