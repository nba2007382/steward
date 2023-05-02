const monito_JD = require('../../models/monito/JD')

class monito {
    async getgoods(req, res, next) {
        const { userEmail } = req.body.userInfo
        const list = await monito_JD.find({ from: userEmail })
        res.send({
            status: 200,
            data: list
        })
    }
    async addgoods(req, res, next) {
        try {
            let params = req.query;
            const url = params.url;
            const { userEmail } = req.body.userInfo
            let regex = /(\d+)\.html$/ //从url中筛选出— id               
                //id
            console.log('==================', url)    
            const id = url.match(regex)[1];
            console.log(id);
            const data = await monito_JD.find({ id })
            if (data.length == 0) {
                await monito_JD.addgoods(url, id, userEmail)
                res.send({
                    status: 200,
                    message: '添加成功'
                })
                return
            }
            const index = await monito_JD.find({ id, from: userEmail })
            if (index.length !== 0) {
                throw new Error('已添加过该商品')
            } else {
                await monito_JD.updateMany({ id }, { $addToSet: { from: userEmail } })
                res.send({
                    status: 200,
                    message: '添加成功'
                })
                return
            }
        } catch (error) {
            res.send({
                status: 404,
                type: 'add_goods_Failed',
                message:'---添加失败'
            })
            return
        }
    }
    async delgoods(req, res, next) {
        try {
            const { id } = req.body
            const { userEmail } = req.body.userInfo
            const data = await monito_JD.find({ id: id, from: userEmail })
            console.log(data[0]);
            console.log(data[0].from);
            if (data[0].from.length == 1) {
                await monito_JD.deleteMany({ id: id, from: userEmail })
                res.send({
                    status: 200,
                    message: '删除成功'
                })
                return
            } else {
                await monito_JD.updateOne({ id }, { $pull: { from: { $in: [userEmail] } } })
                res.send({
                    status: 200,
                    message: '删除成功'
                })
                return
            }
        } catch (err) {
            res.send({
                status: 200,
                message: '删除失败'
            })
            return
        }
    }
}

module.exports = new monito()