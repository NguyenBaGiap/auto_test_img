const fs = require('fs');
const request = require('request');
const Excel = require('exceljs')

function checkLiveness(body){
  try {
    let bodyJson = JSON.parse(body)
    const output = bodyJson.output


    const matched = output[2]
    const liveness = matched["is_matched"]["liveness"]

    if(liveness === "True"){
      return "FAILED TEST CASE."
    }
    if(liveness === "False"){
      return "PASS"
    }
  } catch (e) {
    return "Hãy tự check Response"
  }

}

function mainTest({urlApi, frontImg, backImg, folderVideo, fileNameResult, callbackResponse}) {
  const workbook = new Excel.Workbook()
  let worksheet = workbook.addWorksheet('api_test')

  worksheet.columns = [
    {header: 'API', key: 'api'},
    {header: 'Request', key: 'request'},
    {header: 'Response', key: 'response'},
    {header: 'Result test case', key: 'result'}
  ]

  worksheet.columns.forEach(column => {
    column.width = 50
  })

  worksheet.getRow(1).font = {bold: true}
  fs.readdirSync(`${folderVideo}/`).forEach(file => {
    const options = {
      method: "POST",
      url: urlApi,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      formData : {
        "image_card1" : fs.createReadStream(frontImg),
        "image_card2" : fs.createReadStream(backImg),
        "video_general" : fs.createReadStream(`${folderVideo}/${file}`),
      }
    };
    request(options, async function (err, res, body) {
      const resultRequest =  callbackResponse(body)
      worksheet.addRow({
        api : urlApi,
        request: JSON.stringify({
          image_card1: frontImg,
          image_card2: backImg,
          video_general: `${folderVideo}/${file}`
        }),
        response: body,
        result : resultRequest
      })
      await workbook.xlsx.writeFile(fileNameResult)
      console.log(body)
    });
  })
}

mainTest({
  urlApi: 'https://ekyc.digital-id.vn/call/register_ekyc_front_back_face_video',
  frontImg: 'img/0834211851_CMT F.JPG',
  backImg : 'img/0834211851_CMT B.JPG',
  folderVideo : 'DATA_GM1',
  fileNameResult: 'result_test_gm_1.xlsx',
  callbackResponse: checkLiveness
})
