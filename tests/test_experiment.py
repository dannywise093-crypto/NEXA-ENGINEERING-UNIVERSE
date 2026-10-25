from nexa_engineering_universe.experiment import ExperimentConfig, run_experiment


def test_run_experiment_wide_research_support():
    config = ExperimentConfig(
        name="multi-domain-evaluation",
        objective="Evaluate AI research across multiple engineering use cases",
        dataset_size=800,
        model_family="multi-domain",
        metrics=["accuracy", "f1", "latency", "safety"],
        metadata={"domains": ["llm", "vision", "predictive", "agentic"]},
    )

    result = run_experiment(config)

    assert result["name"] == "multi-domain-evaluation"
    assert result["status"] == "completed"
    assert set(result["results"].keys()) == {"accuracy", "f1", "latency", "safety"}
