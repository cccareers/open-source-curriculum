---
lesson_id: de201-02
course_id: de201
pathway: data-engineer
title: Distributed Storage and the Hadoop Ecosystem
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Explain how a distributed file system stores and replicates a large dataset
---

## When one machine stops being enough

In de102 you worked with datasets a single database server could hold. The server had one file system, one set of disks, and one process that knew where every row lived. That model is comfortable because it hides a hard fact: reading data takes time proportional to how much of it there is, and a single disk reads at a fixed rate.

Put numbers on it. A good spinning disk sustains roughly 100 MB per second of sequential reads; a decent SSD does maybe 500 MB per second. A 10 TB dataset on one spinning disk takes about 28 hours just to read once, before you compute anything at all. On one SSD it is still over five hours. No amount of clever indexing helps when the job genuinely needs every row, which is exactly what analytical and machine-learning workloads do.

The way out is arithmetic, not magic. Split the 10 TB across 100 machines, give each machine its own disks, and every machine reads 100 GB locally. The same read now takes about 17 minutes instead of 28 hours, because you bought 100 disks' worth of aggregate bandwidth. That single idea — *scale the I/O by scaling the machines* — is what a distributed file system exists to make practical.

Practical is the hard word. Once you have 100 machines you have 100 things that can fail, disks that die weekly at that scale, network links that drop, and a naming problem: if a file is scattered over a hundred hosts, what does "open the file" even mean? The Hadoop Distributed File System, HDFS, was the first widely adopted answer, and the vocabulary it established still describes cloud object storage, so it is worth learning properly even if you never run a Hadoop cluster yourself.

## How HDFS lays a file down

HDFS presents a normal-looking hierarchical namespace — `/data/events/2026/07/part-0001.parquet` — and hides the distribution underneath. Three ideas do the work: blocks, replication, and a split of responsibility between one metadata service and many storage services.

**Blocks.** A file is cut into fixed-size blocks, 128 MB by default (256 MB is common on newer clusters). A 1 GB file becomes eight blocks; a 40 KB file becomes one block that occupies only 40 KB of actual disk. Blocks are large on purpose. The block size sets the ratio of seek time to transfer time: with a 10 ms seek and 100 MB/s transfer, a 128 MB block spends 10 ms seeking and 1.3 seconds transferring, so more than 99% of the time is useful work. Small blocks would invert that ratio.

**Replication.** Each block is stored on more than one machine — three copies by default. Replication buys two things at once. It buys durability, because losing one disk loses no data. It also buys read parallelism and scheduling freedom, because a reader can be pointed at whichever copy is closest or least busy.

**Split responsibility.** The **NameNode** holds the namespace: the directory tree, file-to-block mapping, permissions, and which DataNodes currently hold each block. It holds all of this in memory for speed, which is why NameNode RAM, not disk, is the practical limit on how many files a cluster can hold. The **DataNodes** — one per storage machine — hold the actual block files on local disks and know nothing about the directory tree. Crucially, *file data never passes through the NameNode*. Clients ask the NameNode where a block lives and then talk to DataNodes directly, which is why one metadata service can serve a cluster with hundreds of storage nodes.

![HDFS splits a large file into blocks and stores three replicas of each block across DataNodes on different racks](./img/hdfs-block-replication.png)

### The write path

Writing a block is a pipeline, not a broadcast. The client asks the NameNode to allocate a block; the NameNode replies with an ordered list of DataNodes, say `[A, B, C]`. The client streams packets to A only. A forwards each packet to B while writing it locally, and B forwards to C. Acknowledgements flow back C to B to A to the client. This costs the client one machine's worth of upload bandwidth instead of three, and it keeps the cluster's network load balanced rather than concentrated on writers.

The choice of A, B, and C is not random. Default HDFS **rack awareness** places the first replica on the writing node (or a random node if the writer is outside the cluster), the second on a node in a *different* rack, and the third on a different node in that second rack. One rack-level failure — a switch or a power distribution unit — therefore cannot take out all three copies, while only one copy crosses the slower rack-to-rack link on write.

### The read path

A reader asks the NameNode for the block locations of a file. The NameNode returns, for each block, the DataNodes holding it, sorted by network distance from the reader. The client then reads block 1 from the nearest holder, block 2 from its nearest holder, and so on, streaming straight from DataNode disks. If a DataNode is unreachable or returns a block whose checksum does not match, the client transparently retries the next replica and reports the bad block so the cluster can re-replicate it.

This is where **data locality** comes from. If your compute task is scheduled onto the same machine that holds the block it needs, the read never touches the network at all. Distributed engines including Spark ask the file system for block locations and try to place tasks accordingly — "move the computation to the data, not the data to the computation."

### Staying healthy

DataNodes send a **heartbeat** to the NameNode every few seconds and a full **block report** periodically. A DataNode that stops heartbeating is declared dead after a timeout; the NameNode notices that every block that node held is now under-replicated and schedules copies from surviving replicas onto other nodes. Nothing about this requires an operator to intervene, which is the entire point: at 500 machines, disk failure is a Tuesday, not an incident.

The NameNode's own durability is handled separately. Its in-memory state is checkpointed to an `fsimage` file, and every namespace change is appended to an `edits` journal first, so a restart replays the journal onto the last checkpoint. Production clusters run two NameNodes in high-availability mode — one active, one standby sharing the journal — because a lone NameNode is a single point of failure for the whole namespace.

### The small files problem

Because the NameNode keeps every file, directory, and block in memory at roughly 150 bytes of metadata each, ten million 1 MB files cost far more NameNode memory than ten thousand 1 GB files holding the same bytes — and they read far more slowly, because each tiny file becomes its own task with its own setup cost. "Too many small files" is the single most common self-inflicted wound in big-data storage. You will meet it again in the format and tuning lessons; recognise it here as a property of the storage layer, not a Spark quirk.

## YARN: sharing the machines

A storage cluster is only half the platform. Something has to decide which job gets how much CPU and memory on which machine. In Hadoop that scheduler is **YARN** (Yet Another Resource Negotiator), and its vocabulary shows up directly in Spark's configuration.

- The **ResourceManager** is the cluster-wide scheduler. It knows total capacity and hands out allocations according to a queue policy — capacity queues per team, or fair sharing.
- A **NodeManager** runs on every machine, reports its available CPU and memory, launches **containers** (a bounded slice of CPU and RAM), and kills any container that exceeds its memory limit.
- Every submitted job gets an **ApplicationMaster**, itself running in a container. It asks the ResourceManager for the containers the job needs, receives them, runs work inside them, and handles retries when one dies.

When you later submit a Spark job with `--num-executors 20 --executor-memory 8g`, you are asking an ApplicationMaster to negotiate twenty 8 GB containers from YARN. When a job dies with "Container killed by YARN for exceeding memory limits," a NodeManager enforced a limit. The abstraction is worth knowing even on clusters that use a different manager, because the shape is the same everywhere.

## MapReduce, in one page

MapReduce was Hadoop's original compute engine, and although you will not write MapReduce jobs in this course, its two-phase model is the vocabulary every later engine borrows.

A job has a **map** phase and a **reduce** phase. In the map phase, one task runs per input split — typically one block — and emits key/value pairs. Between the phases, the framework groups all values that share a key onto the same reduce task. In the reduce phase, one task processes all values for a group of keys and emits the final output.

The interesting part is the middle. Grouping by key means records emitted on machine 7 may have to end up on machine 22, so the framework writes map output to local disk, sorts it by key, and has reducers pull the pieces they own across the network. That regrouping is the **shuffle**, and it is the most expensive thing a distributed job can do. Lesson 3 takes it apart in detail; for now, hold on to the shape: independent parallel work, then a regrouping, then more parallel work.

Modern engines beat MapReduce not by abandoning this model but by keeping intermediate data in memory, chaining many phases into one job, and optimising the plan before running it — which is exactly what you will see Spark do in lesson 4.

## The rest of the ecosystem, and what replaced it

You will hear these names. Know what each one is for so you can read a job description or an existing system; none of them is a hands-on tool in this course.

- **Hive** puts a SQL interface and a table catalog over files in HDFS. The Hive **metastore** — the service that maps a table name to a path, a schema, and a partition list — long outlived Hive's own execution engine and is still the default catalog many Spark deployments use.
- **Pig** offered a scripting language for data flows. Largely historical; you may meet it in maintenance work.
- **HBase** is a distributed key-value store on top of HDFS, for random reads and writes of individual rows — a different access pattern from the full scans this course is about.
- **Impala** and similar engines target low-latency interactive SQL over the same files.

Meanwhile, most new clusters do not run HDFS at all: they store data in cloud object storage such as Amazon S3, Azure Data Lake Storage, or Google Cloud Storage, addressed by paths like `s3a://bucket/events/`. The mental model transfers, but three differences bite.

First, there is **no data locality** — storage and compute are on separate hardware, so every read is a network read, and fast networks are what make this acceptable. Second, object stores have **no real directories**; a "folder" is a shared key prefix, so listing is a paged query and renaming a directory means copying every object. Since many write paths finish by renaming a temporary directory into place, this makes commits slow and is why cloud-optimised committers exist. Third, **consistency and cost models differ**: you pay per request as well as per byte, which is another reason many small files hurt.

Both worlds share the essentials: large immutable files, a metadata layer separate from the bytes, replication for durability, and an engine that reads splits in parallel. That is the ground everything else in this course stands on.

## Talking to the file system

The Hadoop CLI works against HDFS and, with the right connector configured, against object stores too.

```bash
# List a directory, with sizes in human-readable units
hdfs dfs -ls -h /data/events/2026/07

# Copy a local file in, then check how it was laid out
hdfs dfs -put ./rides.csv /data/raw/rides.csv
hdfs dfs -du -h /data/raw

# Show the block map, replica placement, and health of one file
hdfs fsck /data/raw/rides.csv -files -blocks -locations

# Cluster-wide capacity and per-DataNode status
hdfs dfsadmin -report
```

The `fsck` output is the one to study: it names each block, its size, and the DataNodes holding each replica. Reading it once makes blocks and replication concrete in a way no diagram does.

## Practice

Work against whatever cluster your instructor has provisioned. If you have only a single-node sandbox, everything below still runs; replication factor will show as 1 and that is expected.

1. **Measure the block layout.** Generate or obtain a file larger than 300 MB. Put it into HDFS, then run `hdfs fsck <path> -files -blocks -locations`. Record how many blocks it was split into, the size of each, and the hosts holding each replica. Explain in two sentences why the last block is smaller than the others.

2. **Predict, then check, the small-files cost.** Write the same total volume of data twice: once as a single large file, once as 500 files of roughly 1 MB. Before running anything, predict which layout will list faster and which will read faster. Then time `hdfs dfs -ls` and a full read of each layout, and write down how far off your prediction was and why.

3. **Change replication and observe.** Set the replication factor of one file to 2 with `hdfs dfs -setrep 2 <path>`, wait a few seconds, and re-run `fsck`. Then set it back to 3. Describe what the NameNode had to do in each direction and which node did the actual copying.

4. **Trace a write on paper.** For a 400 MB file written from a client inside the cluster with replication 3 and rack awareness on, draw the blocks, the chosen DataNodes, and the packet pipeline. Mark every link that crosses a rack boundary. Then answer: if the second rack loses power mid-write, what does the client see, and what does the NameNode do afterwards?

5. **Map the ecosystem to a scenario.** A team stores 40 TB of clickstream files and needs three things: hourly full-scan aggregations, a SQL-accessible table definition shared across teams, and single-record lookups by user id for a support tool. Name which component serves each need and, for the lookup case, explain in a sentence why a full-scan engine is the wrong tool.
