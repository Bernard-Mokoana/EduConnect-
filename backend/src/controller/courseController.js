import mongoose from "mongoose";
import { course } from "../model/course.js";

const createCourse = async (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || !price)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingCourse = await course.findOne({ title });
    if (existingCourse)
      return res
        .status(409)
        .json({ message: "Course already exists", course: existingCourse });

    const newCourse = await course.create({
      title,
      category,
      description,
      price,
      tutor: req.user._id,
    });

    return res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create a course", error: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const courses = await course
      .find({ isPublished: true })
      .populate("tutor", "firstName", "lastName");
    return res
      .status(200)
      .json({ message: "courses fetched successfully", course: courses });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
};

const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid course ID format" });

    const foundCourse = await course
      .findById(id)
      .populate("tutor", "firstName lastName");

    if (!foundCourse) {
      return res.status(404).json({ message: "courses not found" });
    }

    return res
      .status(200)
      .json({ message: "Courses found successfully", course: foundCourse });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch course", error: error.message });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, category, description, price, isPublished } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid course Id format" });

    const foundCourse = await course.findById(id);

    if (!foundCourse)
      return res.status(404).json({ message: "Courses not found" });

    if (!foundCourse.tutor.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized - You only update your own courses" });
    }

    if (title !== undefined) foundCourse.title = title;
    if (category !== undefined) foundCourse.category = category;
    if (description !== undefined) foundCourse.description = description;
    if (price !== undefined) foundCourse.price = price;
    if (isPublished !== undefined) foundCourse.isPublished = isPublished;

    const updateCourse = await foundCourse.save();
    return res
      .status(201)
      .json({ message: "Updated successfully", course: updateCourse });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update", error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid course Id format" });

    const foundCourse = await course.findById(id);
    if (!foundCourse)
      return res.status(404).json({ message: "Course not found" });

    if (!foundCourse.tutor.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized - You only  delete your courses" });
    }

    await foundCourse.deleteOne();
    return res.status(201).json({ message: "Course deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete the course" });
  }
};

export { createCourse, getCourse, getCourseById, updateCourse, deleteCourse };
