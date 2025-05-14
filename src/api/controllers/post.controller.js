const slugify=require('slugify');
const db = require('../../database/db.config');
const Post = db.posts;
//creation de nouvelle post
exports.create=(req,res)=>{
    //recuperation des donnees 
    const {title,content,author,slug,tags} =req.body;
    if(!title || !content||!author||!slug||!tags){
        return res.status(400).send({
            message : 'content can not be empty'
        })
    }
    const slugy = slugify(slug,'-');
    const newPost = new Post({
        title: title,
        content: content,
        author: author,
        slug: slug,
        tags: tags
    });
    newPost.save(newPost).then((data)=>{
        res.status(200).send({
            message: 'successufully created post'
        })
    }).catch(err=>{
        console.log(err);
    });
}