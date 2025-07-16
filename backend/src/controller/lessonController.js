import { lessons } from "../model/lessons.js";
import { course } from "../model/course.js";

export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Lessons = await lessons.find({ course: courseId }).sort("order");
    return res
      .status(200)
      .json({ message: "Lessons fetched successfully", Lessons });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the lessons" });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params.id;
    const lesson = await lessons.findById(lessonId);

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    return res
      .status(200)
      .json({ message: "Lesson fetched successfully" }, lesson);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the lessons" });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, videoUrl, order } = req.body;

    const Course = await course.findById(courseId);

    if (!Course) return res.status(404).json({ message: "Course not found" });
    if (!Course.tutor.equals(req.user._id)) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    const Lesson = await lessons.create({
      course: courseId,
      title,
      content,
      videoUrl,
      order,
    });

    return res
      .status(200)
      .json({ message: "Lesson created successfully", Lesson });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating a lesson", error: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, videoUrl, order } = req.body;

    const lesson = await lessons.findById(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const Course = await course.findById(lesson.Course);
    if (!Course.tutor.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    lesson.title = title ?? lesson.title;
    lesson.content = content ?? lesson.content;
    lesson.videoUrl = videoUrl ?? lesson.videoUrl;
    lesson.order = order ?? lesson.order;

    const updated = await lesson.save();

    return res
      .status(200)
      .json({ message: "Lessons updated successfully", updated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating a lesson", error: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await lessons.findById(id);
    if (!lesson) return res.status(404).json({ message: "lesson not found" });

    const Course = await course.findById(lesson.Course);

    if (!Course.tutor.equals.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await lesson.deleteOne();

    return res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting a lesson" });
  }
};
