import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
         
        user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" ,
          },  
        published : {
            type: String,
            index : true,
            required: true,
          },
        date: {
            type: Date,
            default: Date.now(),
          },
          
         
    },
    {timestamps : true },
    
);

const Diary = new mongoose.model("Diary", postSchema);
export default Diary;
