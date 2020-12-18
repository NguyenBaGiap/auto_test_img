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

function createResultPostImageAPI({urlApi, folderPhone, frontImg, backImg, img, video, fileNameResult, callbackResponse, workbook}) {
    let worksheet = workbook.getWorksheet('Register eKYC Face Image')
    let imgFile = frontImg || backImg || img
    let options;
    if(!video){
        options = {
            method: "POST",
            url: urlApi,
            json: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            formData : {
                "image" : fs.createReadStream(imgFile),
            }
        };
    } else {
        options = {
            method: "POST",
            url: urlApi,
            json: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            formData : {
                "video" : fs.createReadStream(video),
            }
        };
    }

    request(options, async function (err, res, body) {
        let req;
        if(!video){
            req = {
                image: imgFile,
            }
        } else {
            req = {
                video: video
            }
        }
        worksheet.addRow({
            api : urlApi,
            font : frontImg,
            back : backImg,
            img : img,
            video : video,
            request: JSON.stringify(req),
            response: JSON.stringify(body)
        })
        await workbook.xlsx.writeFile(fileNameResult)
        console.log(body)
    });

}

function createResultApiImage({urlApi, pathFolderRoot, typeImage, fileNameResult, callbackResponse}){
    const workbook = new Excel.Workbook()
    let worksheet = workbook.addWorksheet('Register eKYC Face Image')

    worksheet.columns = [
        {header: 'API', key: 'api'},
        {header: 'F', key: 'font'},
        {header: 'B', key: 'back'},
        {header: 'A', key: 'img'},
        {header: 'V', key: 'video'},
        {header: 'Request', key: 'request'},
        {header: 'Response', key: 'response'},
    ]

    worksheet.columns.forEach(column => {
        column.width = 50
    })

    worksheet.getRow(1).font = {bold: true}

    fs.readdirSync(`${pathFolderRoot}/`).forEach(async folder => {
        console.log(`folder: ${folder}`)
        let frontImg;let backImg;let img; let video;
        switch(typeImage) {
            case 'F.jpg':
                frontImg = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('F.jpg'))[0]
                break;
            case 'B.jpg':
                backImg = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('B.jpg'))[0]
                break;
            case 'A.jpg':
                img = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('A.jpg'))[0]
                break;
            default:
                video = `${pathFolderRoot}/${folder}/` + fs.readdirSync(`${pathFolderRoot}/${folder}/`).filter(f => f.endsWith('.mp4'))[0]
        }

        createResultPostImageAPI({
            urlApi: urlApi,
            folderPhone: folder,
            frontImg:frontImg,
            backImg:backImg,
            img:img,
            video:video,
            fileNameResult: fileNameResult,
            callbackResponse:callbackResponse,
            workbook:workbook
        })
        await workbook.xlsx.writeFile(fileNameResult)

    })
}

//api img
createResultApiImage({
    urlApi:'https://vpb-ekyc.mlchain.ml/call/check_liveness_face',
    pathFolderRoot:'root/api2',
    typeImage: 'B.jpg',
    fileNameResult:'register_ekyc_front_back_face.xlsx',
    callbackResponse: checkLiveness
})
