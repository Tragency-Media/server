import mongoose from "mongoose";

const postDiary = new mongoose.Schema(
    {
         
          title: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            default: Date.now(),
          },
          file : {
              type : file,
              required : true
          },
          diary : [
            {
                user : {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User" ,
                  },
                content : {
                    type : text,
                    required : true ,
                },
            },
                
            ],

          },
          {timestamps : true },
    
)
