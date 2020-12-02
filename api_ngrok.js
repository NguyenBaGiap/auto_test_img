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
    let worksheet = workbook.getWorksheet('Register eKYC Face Video')

    const options = {
        method: "POST",
        url: urlApi,
        json: true,
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
        worksheet.addRow({
            api : urlApi,
            font : frontImg,
            back : backImg,
            video : video,
            request: JSON.stringify({
                image_card1: frontImg,
                image_card2: backImg,
                video_general: video
            }),
            response: JSON.stringify(body)
        })
        await workbook.xlsx.writeFile(fileNameResult)
        console.log(body)
    });

}

function createResult({urlApi, pathFolderRoot, fileNameResult, callbackResponse}){
    const workbook = new Excel.Workbook()
    let worksheet = workbook.addWorksheet('Register eKYC Face Video')

    worksheet.columns = [
        {header: 'API', key: 'api'},
        {header: 'Font', key: 'font'},
        {header: 'Back', key: 'back'},
        {header: 'Video', key: 'video'},
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

function createResultPostImageAPI({urlApi, folderPhone, frontImg, backImg, img, fileNameResult, callbackResponse, workbook}) {
    let worksheet = workbook.getWorksheet('Register eKYC Face Image')

    const options = {
        method: "POST",
        url: urlApi,
        json: true,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        formData : {
            "image_card1" : fs.createReadStream(frontImg),
            "image_card2" : fs.createReadStream(backImg),
            "image_general" : fs.createReadStream(img),
        }
    };

    request(options, async function (err, res, body) {
        worksheet.addRow({
            api : urlApi,
            font : frontImg,
            back : backImg,
            img : img,
            request: JSON.stringify({
                image_card1: frontImg,
                image_card2: backImg,
                image_general: img
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
        {header: 'Font', key: 'font'},
        {header: 'Back', key: 'back'},
        {header: 'Image', key: 'img'},
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
//api video
createResult({
    urlApi:'http://face-management.ap.ngrok.io/call/register_ekyc_front_back_face_video',
    pathFolderRoot:'root/api1',
    fileNameResult:'register_ekyc_front_back_face_video.xlsx',
    callbackResponse: checkLiveness
})

//api img
createResultApiImage({
    urlApi:'http://face-management.ap.ngrok.io/call/register_ekyc_front_back_face',
    pathFolderRoot:'root/api2',
    fileNameResult:'register_ekyc_front_back_face.xlsx',
    callbackResponse: checkLiveness
})
