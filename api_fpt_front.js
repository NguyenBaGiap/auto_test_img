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

function createResultPostImageAPI({urlApi, folderPhone, frontImg, backImg, img, fileNameResult, callbackResponse, workbook}) {
    let worksheet = workbook.getWorksheet('Register eKYC Face Image')

    const options = {
        method: "POST",
        url: urlApi,
        json: true,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "api-key": "zzTHtL43blS7J8SCgnEa9TSezd7TuRig",
            "tracking_session_id": "c7e9ad38-f1bc-11ea-adc1-0242ac120002",
        },
        formData : {
            "image" : fs.createReadStream(frontImg),
            "check" : 1,
        }
    };

    request(options, async function (err, res, body) {
        worksheet.addRow({
            api : urlApi,
            folder : folderPhone,
            request: JSON.stringify({
                image: frontImg,
                check: 1,
            }),
            response: JSON.stringify(body)
        })
        await workbook.xlsx.writeFile(fileNameResult)
        console.log(body)
    });

}

function createResultApiImage({urlApi, pathFolderRoot, fileNameResult, callbackResponse}){
    const workbook = new Excel.Workbook()
    let worksheet = workbook.addWorksheet('Register eKYC Face Image')

    worksheet.columns = [
        {header: 'API', key: 'api'},
        {header: 'Folder', key: 'folder'},
        {header: 'Request', key: 'request'},
        {header: 'Response', key: 'response'},
    ]

    worksheet.columns.forEach(column => {
        column.width = 50
    })

    worksheet.getRow(1).font = {bold: true}

    fs.readdirSync(`${pathFolderRoot}/`).forEach(async folder => {
        console.log(`folder: ${folder}`)
        let frontImg = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('F.jpg'))[0]
        let backImg = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('B.jpg'))[0]
        let img = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('G.jpg'))[0]

        createResultPostImageAPI({
            urlApi: urlApi,
            folderPhone: folder,
            frontImg:frontImg,
            backImg:backImg,
            img:img,
            fileNameResult: fileNameResult,
            callbackResponse:callbackResponse,
            workbook:workbook
        })
        await workbook.xlsx.writeFile(fileNameResult)

    })
}

//api font
createResultApiImage({
    urlApi:' https://api.fpt.ai/vision/idr/vnm?type=idb&check=1&postcheck=1',
    pathFolderRoot:'root/api2',
    fileNameResult:'fpt_ai_front.xlsx',
    callbackResponse: checkLiveness
})

