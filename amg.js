const fs = require('fs');
const request = require('request');
const Excel = require('exceljs')

const headers = {
        "Token-id": "adecdcd3-94ea-5171-e053-5f4fc10aad78",
        "Token-key": "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoc/PWlHk9JnRdYPjoSwT8gnpCbRe9jvI82P18T001xQY8DXU6jplkZf4XCRI7stUf+j+XHjyro5sNvlMryB9kCAwEAAQ==",
        "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicmVzdHNlcnZpY2UiXSwidXNlcl9uYW1lIjoiYW1pZ29fcG9jMkB2bnB0LnZuIiwiYXV0aG9yaXRpZXMiOlsiVVNFUiJdLCJqdGkiOiIzODM4YTg3ZC0wNjE5LTQwYTQtOWYyNS04MzEzMTM4NzA1ZDMiLCJjbGllbnRfaWQiOiJhZG1pbmFwcCIsInNjb3BlIjpbInJlYWQiXX0.mjC9idR8m9YnVhcF115worDmyy6GD_h3eNaNsYqm8hJATdb9aCNP9R_ETWMQ8rtBCL7heyxxwjD3JbDnoF-Q297PoP7sm4MidQg0Cj_JfxODW3FWUQ4OKXHkGekYFlNGhhOJzix7MIK3se9r91EL_m-OZpJ9dRWLPLLAq5QcpTE2Wv5VexQQq35TSLzLUOyXZ6t5DPZEBVaK-c-GMS58cXeWIWz_gUqJXl6mdn6q_px_encQpctNMwjzHfCr9AFR4PVe7J-Ov28z0wAmMcsNehwZC_qxCZqAHUzDn_CABZrkfLvbhKPobvLD9rXAoWPLnkg5Yk89Mg3uSWqjBPCkTg",
        "mac-address": "WEB-001"
}

const req = {
    "token": "8928skjhfa89298jahga1771vbvb",
    "client_session":"TEST"
}

function checkLiveness(body){
    try {
        let bodyJson = JSON.parse(body)
        const output = bodyJson.object
        if(output["liveness_msg"]){
            return output["liveness_msg"]
        }
        return output["result"]

    } catch (e) {
        return "N/A"
    }

}

function createResult({urlApi1, urlApi2, folderImg, fileNameResult, callbackResponse}){
    const workbook = new Excel.Workbook()
    let worksheet = workbook.addWorksheet('api_test')

    worksheet.columns = [
        {header: 'API_1', key: 'api1'},
        {header: 'API_2', key: 'api2'},
        {header: 'Request_API_1', key: 'request1'},
        {header: 'Response_API_1', key: 'response1'},
        {header: 'Request_API_2', key: 'request2'},
        {header: 'Response_API_2', key: 'response2'},
        {header: 'Result test case', key: 'result'}
    ]

    worksheet.columns.forEach(column => {
        column.width = 50
    })

    worksheet.getRow(1).font = {bold: true}

    fs.readdir(`${folderImg}/`,  async (errors, files) => {
        // create multi request
        files.map( file => {
            const options = {
                method: "POST",
                url: urlApi1,
                headers: {
                    ...headers,
                    "Content-Type": "multipart/form-data"
                },
                formData : {
                    "file" : fs.createReadStream(`${folderImg}/${file}`),
                    "title" : "title ocr",
                    "description" : "description ocr",
                }
            };

            request(options, async function (err, res, body) {
                const img = JSON.parse(body)["object"]["hash"]
                console.log(img)
                const optionRequest02 = {
                    method: "POST",
                    url: urlApi2,
                    headers: {
                        ...headers,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...req,
                        "img": img
                    })
                };
                request(optionRequest02, async function (err2, res2, body2) {
                    const resultRequest =  await callbackResponse(body2)
                    worksheet.addRow({
                        api1 : urlApi1,
                        api2 : urlApi2,
                        request1: JSON.stringify({
                            "file" : `${folderImg}/${file}`,
                            "title" : "title ocr",
                            "description" : "description ocr",
                        }),
                        response1: body,
                        request2: JSON.stringify({
                            ...req,
                            "img": img
                        }),
                        response2: body2,
                        result : resultRequest
                    })
                    await workbook.xlsx.writeFile(fileNameResult)
                });
                await workbook.xlsx.writeFile(fileNameResult)
            });
        })
        await workbook.xlsx.writeFile(fileNameResult)
    });
}
createResult({
    urlApi1:'https://api.amigofintech.vn/file-service/v2/addFile',
    urlApi2:'https://api.amigofintech.vn/ai/v1/face/liveness',
    folderImg:'img',
    fileNameResult:'test_add_file_FaceLiveness.xlsx',
    callbackResponse: checkLiveness
})
