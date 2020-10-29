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
            return "Pass"
        }
        if(liveness === "False"){
            return "Fail"
        }
    } catch (e) {
        return "N/A"
    }

}


function createResultPostAPI({urlApi, folderPhone, frontImg, backImg, video, fileNameResult, callbackResponse, workbook}) {
    let worksheet = workbook.getWorksheet('api_test')

    const options = {
        method: "POST",
        url: urlApi,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        formData : {
            "image_card1" : fs.createReadStream(frontImg),
            "image_card2" : fs.createReadStream(backImg),
            "video_general" : fs.createReadStream(video),
        }
    };

    request(options, async function (err, res, body) {
        const resultRequest =  callbackResponse(body)
        worksheet.addRow({
            api : urlApi,
            request: JSON.stringify({
                image_card1: frontImg,
                image_card2: backImg,
                video_general: video
            }),
            response: body,
            phone: folderPhone,
            result : resultRequest
        })
        await workbook.xlsx.writeFile(fileNameResult)
        console.log(body)
    });

}

function createResult({urlApi, pathFolderRoot, fileNameResult, callbackResponse}){
    const workbook = new Excel.Workbook()
    let worksheet = workbook.addWorksheet('api_test')

    worksheet.columns = [
        {header: 'API', key: 'api'},
        {header: 'Request', key: 'request'},
        {header: 'Response', key: 'response'},
        {header: 'Folder phone', key: 'phone'},
        {header: 'Result test case', key: 'result'}
    ]

    worksheet.columns.forEach(column => {
        column.width = 50
    })

    worksheet.getRow(1).font = {bold: true}

    fs.readdirSync(`${pathFolderRoot}/`).forEach(async folder => {
        console.log(`folder: ${folder}`)
        let frontImg = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('F.jpg'))[0]
        let backImg = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('B.jpg'))[0]
        let video = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('.mp4'))[0]
        console.log(`frontImg: ${frontImg}`)
        console.log(`backImg: ${backImg}`)
        console.log(`video: ${video}`)


        createResultPostAPI({
            urlApi: urlApi,
            folderPhone: folder,
            frontImg:frontImg,
            backImg:backImg,
            video:video,
            fileNameResult: fileNameResult,
            callbackResponse:callbackResponse,
            workbook:workbook
        })
        await workbook.xlsx.writeFile(fileNameResult)

    })
}
createResult({
    urlApi:'https://ekyc.digital-id.vn/call/register_ekyc_front_back_face_video',
    pathFolderRoot:'testmultidata',
    fileNameResult:'test_multi_folder.xlsx',
    callbackResponse: checkLiveness
})
