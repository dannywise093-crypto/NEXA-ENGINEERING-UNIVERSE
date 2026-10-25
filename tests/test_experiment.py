from nexa_engineering_universe.experiment import ExperimentConfig, run_experiment


def test_run_experiment_returns_metrics():
    config = ExperimentConfig(
        name="baseline-1",
        objective="validate the research pipeline",
        dataset_size=500,
        model_family="transformer",
        metrics=["accuracy", "f1", "latency"],
        metadata={"team": "nexa"},
    )

    result = run_experiment(config)

    assert result["name"] == "baseline-1"
    assert result["status"] == "completed"
    assert set(result["results"].keys()) == {"accuracy", "f1", "latency"}
