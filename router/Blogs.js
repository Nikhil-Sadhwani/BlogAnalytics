const express = require('express');
const _ = require('lodash');
const axios = require('axios');

const router = express.Router();

// Storing Caching blog data
const blogsCache = {};

// Fetching all Blogs and Analysis blogs
router.get("/blog-stats" , async (req , res) => {
    try{

        const blogsArray = await isBlogsCache();

        const analysisResult = await functionOfMemoize(blogsArray);

        res.json({data: analysisResult, message : "Blogs are fetched"});
    }
    catch(err){
        res.status(500).json({error : "Faild to fetch data"});
    }
});

// Fetching blogs by using query parameter
router.get("/blog-search" , async (req , res) => {
    try{
        // Get query parameter in val variable
        const val = req.query.query || "" ;
        
        // Check the query parameter is empty or not
        if(!val.trim()){
            res.status(500).json({error: "Invalid Query Params"});
        }

        const blogs = await isBlogsCache();

        // Fetch blogs according to the query parameters
        const searchBlogs = _.filter(blogs , (blog) => {return _.includes(_.toLower(blog.title), _.toLower(val))});
       
        res.json({ searchBlogs, message : "Blogs are fetched by search"});
    }
    catch(err){
        res.status(500).json({error : "Faild to fetch data Please check the query params "});
    }
});

// Check the blogs cache data is set or not 
async function isBlogsCache(){

    // If cache is set then return that stored blogs data
    if(blogsCache.blogs){
        return blogsCache.blogs;
    }

    // If cache is not set refeching data from API
    const fetchedData = await axios.get("https://intent-kit-16.hasura.app/api/rest/blogs " , {
        headers:{
            'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
    });

    const blogsArray = fetchedData.data.blogs;
    blogsCache.blogs = blogsArray;

    // set certain period 
    setTimeout(() => {
        delete blogsCache.blogs;
    }, 60000);

    return blogsArray;
}

// Memoize function for optimizaion of code
const functionOfMemoize = _.memoize(async (blogsArray) => {

    const totalNumbersBlogs = blogsArray.length;
    const longestTitleBlogs =  _.maxBy(blogsArray , 'title.length');
    const blogsWithSpecificTitle = _.filter(blogsArray , (blog) => {return _.includes(_.toLower(blog.title) , 'privacy')});
    const uniqueTitleBlogs =  _.uniqBy(blogsArray , 'title');

    const analysisResult ={
        totalNumbersBlogs : totalNumbersBlogs,
        longestTitleBlogs : longestTitleBlogs.title,
        blogsWithSpecificTitle : blogsWithSpecificTitle.length,
        uniqueTitleBlogs : uniqueTitleBlogs.map((blog)=> {return blog.title})
    };

    return analysisResult;
})

module.exports = router;