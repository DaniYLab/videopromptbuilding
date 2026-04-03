from pathlib import Path

from app.schemas import Character, FramePrompt, Project, Scene, Story
from app.services.project_service import ProjectStore


def test_project_store_persists_and_deletes_related_records(tmp_path: Path) -> None:
    db_path = tmp_path / "scriptforge-test.db"

    store = ProjectStore(db_path)
    project = store.create_project(Project(title="Store Test"))

    store.save_story(
        Story(
            project_id=project.id,
            title="A test story",
            genre="Drama",
            theme="Hope",
            synopsis="A short synopsis",
            key_plot_points=["Start", "Middle", "End"],
            num_scenes=1,
            raw_prompt="cinematic prompt",
        )
    )
    store.save_characters(
        project.id,
        [
            Character(
                project_id=project.id,
                name="Linh",
                role="Protagonist",
                appearance="Short black hair",
                personality="Calm",
                visual_prompt="portrait prompt",
            )
        ],
    )
    scene = Scene(
        project_id=project.id,
        scene_index=0,
        title="Opening",
        description="The opening scene",
        action="Walks forward",
        camera_angle="Wide shot",
        lighting="Neon dusk",
        mood="Tense",
        visual_prompt="scene prompt",
    )
    store.save_scenes(project.id, [scene])
    store.save_frame(
        FramePrompt(
            project_id=project.id,
            scene_id=scene.id,
            scene_index=0,
            start_frame_prompt="start frame",
            end_frame_prompt="end frame",
            style_notes="keep colors consistent",
        )
    )
    store.close()

    reopened = ProjectStore(db_path)
    assert reopened.get_project(project.id) is not None
    assert reopened.get_story(project.id) is not None
    assert len(reopened.get_characters(project.id)) == 1
    assert len(reopened.get_scenes(project.id)) == 1
    assert len(reopened.get_frames(project.id)) == 1

    assert reopened.delete_project(project.id) is True
    assert reopened.get_project(project.id) is None
    assert reopened.get_story(project.id) is None
    assert reopened.get_characters(project.id) == []
    assert reopened.get_scenes(project.id) == []
    assert reopened.get_frames(project.id) == []
    reopened.close()
